-- CreateTable
CREATE TABLE "RealEstateLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "preferredTime" TEXT NOT NULL,
    "notes" TEXT,
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

-- CreateIndex
CREATE INDEX "RealEstateLead_status_idx" ON "RealEstateLead"("status");

-- CreateIndex
CREATE INDEX "RealEstateLead_createdAt_idx" ON "RealEstateLead"("createdAt");

-- CreateIndex
CREATE INDEX "RealEstateLead_phone_idx" ON "RealEstateLead"("phone");

-- CreateIndex
CREATE INDEX "RealEstateLead_email_idx" ON "RealEstateLead"("email");
