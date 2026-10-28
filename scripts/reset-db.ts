/**
 * ⚠ DESTRUCTIVE — drops the whole public schema and re-creates it.
 * Use only in development. Prompts before proceeding.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import * as readline from "node:readline/promises";
import { Client } from "pg";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to reset production database.");
    process.exit(1);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("⚠  This will DROP all tables. Type RESET to continue: ");
  rl.close();
  if (answer !== "RESET") { console.log("Aborted."); process.exit(0); }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query("drop schema public cascade; create schema public;");
  await client.query("grant all on schema public to postgres; grant all on schema public to public;");
  await client.end();
  console.log("✅ Public schema reset.");
}
main().catch((e) => { console.error(e); process.exit(1); });