-- Allows stealing a stuck demo-seed lock after the window below (dev server killed mid-seed, etc.).
ALTER TABLE "User" ADD COLUMN "demoSeedLockStartedAt" TIMESTAMP(3);
