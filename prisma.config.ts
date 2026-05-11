import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads `.env.local` by default; Prisma CLI only auto-loads `.env`.
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env or .env.local (see .env.example), or export it before running Prisma CLI."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
