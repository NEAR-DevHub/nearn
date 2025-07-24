-- AlterTable
ALTER TABLE `PoW` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `PoW_userId_displayOrder_idx` ON `PoW`(`userId`, `displayOrder`);
