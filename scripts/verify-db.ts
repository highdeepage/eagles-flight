import { config } from "dotenv";
config({ path: ".env.local" });
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const tables = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' order by table_name;
  `);
  console.log(`\n✅ ${tables.rowCount} tables present:\n`);
  tables.rows.forEach((t) => console.log("  •", t.table_name));

  const { rows: migrations } = await client.query(
    "select filename, applied_at from public.schema_migrations order by filename",
  );
  console.log("\nMigrations applied:");
  migrations.forEach((m) => console.log(`  ✓ ${m.filename}  (${m.applied_at})`));

  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });