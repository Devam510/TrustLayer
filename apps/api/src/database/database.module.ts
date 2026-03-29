import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@trustlayer/db'

export const DATABASE_TOKEN = 'DATABASE'

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL')
        // PgBouncer transaction mode: disable prepared statements
        const client = postgres(url, { prepare: false })
        return drizzle(client, { schema })
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
