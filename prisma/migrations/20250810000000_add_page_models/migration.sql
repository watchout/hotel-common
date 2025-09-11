-- CreateTable
CREATE TABLE "pages" (
    "Id" TEXT NOT NULL,
    "TenantId" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Html" TEXT,
    "Css" TEXT,
    "Content" TEXT,
    "Template" TEXT,
    "IsPublished" BOOLEAN NOT NULL DEFAULT false,
    "PublishedAt" TIMESTAMP(3),
    "Version" INTEGER NOT NULL DEFAULT 1,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "page_histories" (
    "Id" TEXT NOT NULL,
    "PageId" TEXT NOT NULL,
    "Html" TEXT,
    "Css" TEXT,
    "Content" TEXT,
    "Template" TEXT,
    "Version" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" TEXT,

    CONSTRAINT "page_histories_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_TenantId_Slug_key" ON "pages"("TenantId", "Slug");

-- CreateIndex
CREATE INDEX "pages_TenantId_idx" ON "pages"("TenantId");

-- CreateIndex
CREATE INDEX "pages_Slug_idx" ON "pages"("Slug");

-- CreateIndex
CREATE INDEX "pages_IsPublished_idx" ON "pages"("IsPublished");

-- CreateIndex
CREATE INDEX "page_histories_PageId_idx" ON "page_histories"("PageId");

-- CreateIndex
CREATE INDEX "page_histories_Version_idx" ON "page_histories"("Version");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_histories" ADD CONSTRAINT "page_histories_PageId_fkey" FOREIGN KEY ("PageId") REFERENCES "pages"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
