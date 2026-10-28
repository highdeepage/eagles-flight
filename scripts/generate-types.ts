import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { spawnSync } from "node:child_process";

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /https:\/\/(.+)\.supabase\.co/,
)?.[1];

if (!projectRef) {
  console.error("❌ Cannot derive project ref from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const res = spawnSync(
  "npx",
  [
    "supabase", "gen", "types", "typescript",
    "--project-id", projectRef,
    "--schema", "public",
  ],
  { encoding: "utf8", shell: process.platform === "win32" },
);

if (res.status !== 0) {
  console.error(res.stderr);
  process.exit(1);
}

console.log(res.stdout);