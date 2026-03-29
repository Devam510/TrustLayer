import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Use DATABASE_URL_UNPOOLED for migrations, DATABASE_URL (PgBouncer) for queries
const connectionString = process.env.DATABASE_URL!

// Disable prefetch for PgBouncer transaction mode compatibility
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })

export type Database = typeof db

// Helper: set app.user_id for RLS evaluation per request
export async function setRlsUserId(userId: string): Promise<void> {
  await client`SELECT set_config('app.user_id', ${userId}, true)`
}
