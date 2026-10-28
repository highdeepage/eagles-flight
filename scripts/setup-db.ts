/**
 * One-command database setup:
 *  1. Applies migrations
 *  2. Applies seeds
 *  3. Creates the first admin user (via Supabase Auth admin API)
 *  4. Prints a verification table of every table + row count
 *  5. Prints admin credentials for first login
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

async function main() {
  console.log("\n═══ Eagles Flight — Database Setup ═══\n");

  // 1. Migrations
  run("npx", ["tsx", "scripts/migrate.ts"]);

  // 2. Seeds
  run("npx", ["tsx", "scripts/seed.ts"]);

  // 3. First admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.FIRST_ADMIN_EMAIL ?? "admin@eaglesflight.local";
  const adminPassword = process.env.FIRST_ADMIN_PASSWORD ?? "ChangeMe!2025";

  if (!url || !serviceKey) {
    console.warn("\n⚠  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — skipping admin creation.");
  } else {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: list } = await supabase.auth.admin.listUsers();
    const exists = list?.users?.find((u) => u.email === adminEmail);

    if (exists) {
      console.log(`\n⏭  Admin ${adminEmail} already exists.`);
    } else {
      const { error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: "admin", full_name: "System Administrator" },
      });
      if (error) {
        console.error("❌ Failed to create admin:", error.message);
      } else {
        console.log(`\n✅ Admin created: ${adminEmail}`);
      }
    }
  }

  // 4. Verification
  const dbUrl = process.env.DATABASE_URL!;
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows } = await client.query<{ table_name: string; row_count: string }>(`
    select
      c.relname as table_name,
      (xpath('/row/c/text()', query_to_xml(
        format('select count(*) as c from public.%I', c.relname), false, true, ''
      )))[1]::text as row_count
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.relname;
  `);
  await client.end();

  console.log("\n═══ Tables created ═══\n");
  console.log("Table".padEnd(32) + "Rows");
  console.log("─".repeat(40));
  for (const r of rows) {
    console.log(r.table_name.padEnd(32) + r.row_count);
  }

  console.log("\n═══ First Login ═══\n");
  console.log(`  URL:      ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`);
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("\n  ⚠  Change this password on first login.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});