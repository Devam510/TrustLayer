import postgres from 'postgres';
import * as schema from './schema';
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
export type Database = typeof db;
export declare function setRlsUserId(userId: string): Promise<void>;
//# sourceMappingURL=client.d.ts.map