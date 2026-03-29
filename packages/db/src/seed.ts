import postgres from 'postgres'

/**
 * DB seed / init script — run once after migrations.
 * Handles:
 * 1. pg_partman setup for balance_checks
 * 2. audit_logs immutability trigger
 * 3. plan_limits seeding
 */
async function seed() {
  const sql = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, {
    max: 1,
  })

  console.warn('[seed] Starting database seed...')

  try {
    // 1. pg_partman extension + parent setup for balance_checks
    await sql`CREATE EXTENSION IF NOT EXISTS pg_partman`
    await sql`
      SELECT partman.create_parent(
        p_parent_table := 'public.balance_checks',
        p_control := 'checked_at',
        p_type := 'range',
        p_interval := 'monthly',
        p_retention := '90 days',
        p_retention_keep_table := false
      )
    `
    console.warn('[seed] pg_partman configured for balance_checks')

    // 2. Audit logs immutability trigger
    await sql`
      CREATE OR REPLACE FUNCTION prevent_audit_modification() RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'audit_logs are immutable — no updates or deletes permitted';
      END;
      $$ LANGUAGE plpgsql
    `
    await sql`
      DROP TRIGGER IF EXISTS audit_immutable ON audit_logs
    `
    await sql`
      CREATE TRIGGER audit_immutable
        BEFORE UPDATE OR DELETE ON audit_logs
        FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification()
    `
    console.warn('[seed] audit_logs immutability trigger installed')

    // 3. Seed plan_limits
    await sql`
      INSERT INTO plan_limits (plan, max_projects, max_clients, check_interval_min, email_alerts, webhook_alerts, api_access)
      VALUES
        ('free',   1,    1,    30, true,  false, false),
        ('pro',    10,   10,   5,  true,  true,  false),
        ('agency', null, null, 1,  true,  true,  true)
      ON CONFLICT (plan) DO UPDATE SET
        max_projects       = EXCLUDED.max_projects,
        max_clients        = EXCLUDED.max_clients,
        check_interval_min = EXCLUDED.check_interval_min,
        email_alerts       = EXCLUDED.email_alerts,
        webhook_alerts     = EXCLUDED.webhook_alerts,
        api_access         = EXCLUDED.api_access
    `
    console.warn('[seed] plan_limits seeded')

    console.warn('[seed] Done.')
  } catch (err) {
    console.error('[seed] Error:', err)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

seed()
