import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Only load .env file if DATABASE_URL is not already set by the shell
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '../../.env' })
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
