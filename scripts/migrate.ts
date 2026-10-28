/**
 * Applies all SQL files in supabase/migrations/ in filename order.
 * Tracks applied migrations in public.schema_migrations.
 * Idempotent: already-applied migrations are skipped.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Client } from "pg";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    process.exit(1);
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    create table if not exists public.schema_migrations (
      filename   text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await client.query(
      "select 1 from public.schema_migrations where filename = $1",
      [file],
    );
    if (rows.length > 0) {
      console.log(`⏭  ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`▶  Applying ${file} ...`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into public.schema_migrations (filename) values ($1)",
        [file],
      );
      await client.query("commit");
      console.log(`✅ ${file}`);
    } catch (err) {
      await client.query("rollback");
      console.error(`❌ ${file} failed:`, err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log("✅ All migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});