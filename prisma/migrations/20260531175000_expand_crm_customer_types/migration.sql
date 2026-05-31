-- Expand CRM data allocation categories beyond real-estate/general.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idNumber" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "altPhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT,
    "source" TEXT,
    "customerType" TEXT NOT NULL DEFAULT 'general' CHECK ("customerType" IN ('general', 'insurance', 'investments', 'finance', 'real_estate')),
    "status" TEXT NOT NULL DEFAULT 'new',
    "lastCallOutcome" TEXT CHECK ("lastCallOutcome" IS NULL OR "lastCallOutcome" IN ('called', 'no_answer', 'interested', 'not_interested', 'follow_up', 'appointment_scheduled', 'wrong_number')),
    "nextFollowUpAt" DATETIME,
    "agentId" TEXT,
    "agencyId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Lead" ("id", "idNumber", "firstName", "lastName", "email", "phone", "altPhone", "address", "city", "birthDate", "gender", "source", "customerType", "status", "lastCallOutcome", "nextFollowUpAt", "agentId", "agencyId", "metadata", "notes", "isActive", "createdAt", "updatedAt")
SELECT "id", "idNumber", "firstName", "lastName", "email", "phone", "altPhone", "address", "city", "birthDate", "gender", "source", "customerType", "status", "lastCallOutcome", "nextFollowUpAt", "agentId", "agencyId", "metadata", "notes", "isActive", "createdAt", "updatedAt" FROM "Lead";

DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";

CREATE UNIQUE INDEX "Lead_idNumber_key" ON "Lead"("idNumber");
CREATE INDEX "Lead_agencyId_idx" ON "Lead"("agencyId");
CREATE INDEX "Lead_agentId_idx" ON "Lead"("agentId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_customerType_idx" ON "Lead"("customerType");
CREATE INDEX "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
