-- AlterTable
ALTER TABLE "Client" ADD COLUMN "nameKey" TEXT;

-- CreateTable
CREATE TABLE "MonthlyTicketHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalTickets" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyTicketHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MonthlyTicketHistory_clientId_year_month_key" ON "MonthlyTicketHistory"("clientId", "year", "month");
CREATE UNIQUE INDEX "Client_nameKey_key" ON "Client"("nameKey");
