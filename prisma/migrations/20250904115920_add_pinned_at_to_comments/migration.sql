-- AlterTable
ALTER TABLE `Comment` ADD COLUMN `pinnedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Comment_pinnedAt_idx` ON `Comment`(`pinnedAt` DESC);
