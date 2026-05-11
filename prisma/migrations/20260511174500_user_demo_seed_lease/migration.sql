-- Serialize demo seed across concurrent POST /api/demo/seed (client retries, Strict Mode, multiple tabs).
ALTER TABLE "User" ADD COLUMN "demoSeedLeaseUntil" TIMESTAMP(3);
