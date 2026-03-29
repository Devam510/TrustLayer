const postgres = require('postgres');
const sql = postgres('postgresql://trustlayer:trustlayer@127.0.0.1:5434/trustlayer');
sql`SELECT 1`.then(console.log).catch(console.error).finally(()=>process.exit(0));
