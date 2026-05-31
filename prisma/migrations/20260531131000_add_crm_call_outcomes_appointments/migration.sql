-- Add structured CRM sales workflow fields.
ALTER TABLE "Lead" ADD COLUMN "customerType" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "Lead" ADD COLUMN "lastCallOutcome" TEXT;
ALTER TABLE "Lead" ADD COLUMN "nextFollowUpAt" DATETIME;
ALTER TABLE "LeadCommunication" ADD COLUMN "outcome" TEXT;

-- Calendar appointments are separate records so follow-ups survive lead edits
-- and remain tied to the same canonical lead identity.
CREATE TABLE "LeadAppointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeadAppointment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadAppointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Lead_customerType_idx" ON "Lead"("customerType");
CREATE INDEX "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");
CREATE INDEX "LeadCommunication_outcome_idx" ON "LeadCommunication"("outcome");
CREATE INDEX "LeadAppointment_leadId_idx" ON "LeadAppointment"("leadId");
CREATE INDEX "LeadAppointment_scheduledAt_idx" ON "LeadAppointment"("scheduledAt");
CREATE INDEX "LeadAppointment_status_idx" ON "LeadAppointment"("status");
CREATE INDEX "LeadAppointment_createdById_idx" ON "LeadAppointment"("createdById");
