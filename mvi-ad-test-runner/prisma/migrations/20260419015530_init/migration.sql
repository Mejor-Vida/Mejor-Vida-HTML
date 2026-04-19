-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "audience" TEXT NOT NULL DEFAULT '{}',
    "budget" TEXT NOT NULL DEFAULT '{}',
    "schedule" TEXT NOT NULL DEFAULT '{}',
    "testVariable" TEXT NOT NULL DEFAULT 'hook',
    "scheduleMode" TEXT NOT NULL DEFAULT 'SIMULTANEOUS',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "primaryMetric" TEXT NOT NULL DEFAULT 'COST_PER_WHATSAPP',
    "metricWeights" TEXT,
    "notes" TEXT,
    "parentRoundId" TEXT,
    "winnerVariantId" TEXT,
    "lockedHookText" TEXT,
    "lockedImageKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Round_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Round_parentRoundId_fkey" FOREIGN KEY ("parentRoundId") REFERENCES "Round" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Round_winnerVariantId_fkey" FOREIGN KEY ("winnerVariantId") REFERENCES "Variant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "label" TEXT,
    "hookText" TEXT,
    "bulletText" TEXT,
    "ctaText" TEXT,
    "headlineSize" INTEGER,
    "imagePath" TEXT,
    "previewPath" TEXT,
    "sourcePath" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "facebookCreativeId" TEXT,
    "facebookAdId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Variant_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoundResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "weightedScore" REAL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoundResult_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacebookSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "fingerprint" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FacebookSubmission_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "headlines" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Round_winnerVariantId_key" ON "Round"("winnerVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundResult_roundId_variantId_key" ON "RoundResult"("roundId", "variantId");
