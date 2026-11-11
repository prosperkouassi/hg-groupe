import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
const file = process.argv[2];
if (!['20261111_blog.sql','20261111_blog_ai_schedule.sql'].includes(file)) {
  console.error('Usage : node --env-file=.env.local scripts/migrate-blog.mjs 20261111_blog_ai_schedule.sql');
  process.exitCode = 1;
} else {
  let connection;
  try {
    const sql = await readFile(path.join(process.cwd(),'migrations',file),'utf8');
    connection = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, multipleStatements: true });
    // Only the two allowlisted local, reviewed SQL migrations can be run.
    await connection.query(sql);
    console.log(`Migration réussie : ${file}`);
  } catch (error) { console.error('Migration échouée :',error.message); process.exitCode = 1; }
  finally { await connection?.end(); }
}
