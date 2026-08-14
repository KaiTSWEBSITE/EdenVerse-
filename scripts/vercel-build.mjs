import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const { ignoreError, ...spawnOptions } = options;
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...spawnOptions
  });

  if (result.error) {
    console.error(result.error.message);
    if (!ignoreError) process.exit(1);
  }

  if (result.status !== 0) {
    if (!ignoreError) process.exit(result.status ?? 1);
    else console.warn(`Command ${command} ${args.join(" ")} failed with status ${result.status}, but continuing...`);
  }
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
const shouldRunMigrations = hasDatabaseUrl && process.env.VERCEL === "1";
const runtimeDatabaseUrl = process.env.DATABASE_URL;

run("npx", ["prisma", "generate"]);

if (shouldRunMigrations) {
  if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  }

  console.log("Attempting to push schema to database...");
  run("npx", ["prisma", "db", "push", "--accept-data-loss"], { ignoreError: true });
  process.env.DATABASE_URL = runtimeDatabaseUrl;
}

run("npx", ["next", "build"]);
