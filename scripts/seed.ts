/**
 * Runs every .sql file in supabase/seed/ in order.
 * Idempotent — seeds use ON CONFLICT clauses.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Client } from "pg";

const SEED_DIR = join(process.cwd(), "supabase", "seed");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const files = (await readdir(SEED_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = await readFile(join(SEED_DIR, file), "utf8");
    console.log(`▶  Seeding ${file} ...`);
    await client.query(sql);
    console.log(`✅ ${file}`);
  }
  await client.end();
  console.log("✅ Seeds applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});