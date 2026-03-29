-- TrustLayer PostgreSQL Init Script
-- Runs once on first container startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- pg_partman requires superuser; install via psql after container starts
-- CREATE EXTENSION IF NOT EXISTS "pg_partman";

-- Set timezone
SET timezone = 'UTC';
