-- Migration: 0001_rls_policies_and_indexes.sql
-- Applied by Drizzle via custom SQL migration
-- RLS policies for all tenant-specific tables + critical indexes

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_access ON projects USING (
    freelancer_id = current_setting('app.user_id')::UUID
    OR client_id  = current_setting('app.user_id')::UUID
    OR org_id IN (SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID)
  );

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY alerts_access ON alerts USING (
    user_id = current_setting('app.user_id')::UUID
    OR org_id IN (SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID)
  );

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY bank_accounts_access ON bank_accounts USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_keys_access ON api_keys USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID)
);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_deliveries_access ON webhook_deliveries USING (
  alert_id IN (SELECT id FROM alerts WHERE org_id IN (
      SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID
    ))
);

ALTER TABLE balance_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY balance_checks_access ON balance_checks USING (
  project_id IN (SELECT id FROM projects WHERE freelancer_id = current_setting('app.user_id')::UUID
    OR client_id = current_setting('app.user_id')::UUID
    OR org_id IN (SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID)
  )
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_access ON subscriptions USING (
  org_id IN (SELECT org_id FROM org_members WHERE user_id = current_setting('app.user_id')::UUID AND role IN ('owner', 'admin'))
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_preferences_access ON notification_preferences USING (
  user_id = current_setting('app.user_id')::UUID
);

-- ─────────────────────────────────────────────────────────────────
-- CRITICAL PERFORMANCE INDEXES
-- ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash);
CREATE INDEX IF NOT EXISTS idx_balance_checks_project_recent ON balance_checks (project_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_freelancer ON projects (freelancer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects (client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_user_created ON alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_invite_token ON projects (invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members (user_id);
