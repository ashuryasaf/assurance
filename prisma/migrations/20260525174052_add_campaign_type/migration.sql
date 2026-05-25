-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RealEstateLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "preferredTime" TEXT NOT NULL,
    "notes" TEXT,
    "campaignType" TEXT NOT NULL DEFAULT 'real-estate',
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedAgentId" TEXT,
    "convertedLeadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RealEstateLead" ("assignedAgentId", "convertedLeadId", "createdAt", "email", "fullName", "id", "ipAddress", "notes", "phone", "preferredTime", "referrer", "source", "status", "updatedAt", "userAgent", "utmCampaign", "utmContent", "utmMedium", "utmSource", "utmTerm") SELECT "assignedAgentId", "convertedLeadId", "createdAt", "email", "fullName", "id", "ipAddress", "notes", "phone", "preferredTime", "referrer", "source", "status", "updatedAt", "userAgent", "utmCampaign", "utmContent", "utmMedium", "utmSource", "utmTerm" FROM "RealEstateLead";
DROP TABLE "RealEstateLead";
ALTER TABLE "new_RealEstateLead" RENAME TO "RealEstateLead";
CREATE INDEX "RealEstateLead_status_idx" ON "RealEstateLead"("status");
CREATE INDEX "RealEstateLead_createdAt_idx" ON "RealEstateLead"("createdAt");
CREATE INDEX "RealEstateLead_phone_idx" ON "RealEstateLead"("phone");
CREATE INDEX "RealEstateLead_email_idx" ON "RealEstateLead"("email");
CREATE INDEX "RealEstateLead_campaignType_idx" ON "RealEstateLead"("campaignType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
