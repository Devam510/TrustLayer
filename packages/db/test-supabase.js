const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wcsbadpcfsroxfipckng:Devam%4015100510@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require');
sql`SELECT 1`.then(console.log).catch(console.error).finally(()=>process.exit(0));
