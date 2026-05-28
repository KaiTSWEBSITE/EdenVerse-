import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
const runtimeDatabaseUrl = process.env.DATABASE_URL;

run("npx", ["prisma", "generate"]);

if (hasDatabaseUrl) {
  if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  }

  run("npx", ["prisma", "migrate", "deploy"]);
  process.env.DATABASE_URL = runtimeDatabaseUrl;
}

run("npx", ["next", "build"]);
