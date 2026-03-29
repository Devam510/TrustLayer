const postgres = require('postgres');
const sql = postgres('postgresql://postgres:Devam%4015100510@db.wcsbadpcfsroxfipckng.supabase.co:5432/postgres?sslmode=require');
sql`SELECT 1`.then(console.log).catch(console.error).finally(()=>process.exit(0));
