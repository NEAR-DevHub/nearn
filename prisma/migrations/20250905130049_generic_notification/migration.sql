/*
  Warnings:

  - You are about to drop the column `emailSentAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `channel` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Notification_userId_emailSentAt_idx` ON `Notification`;

-- DropIndex
DROP INDEX `Notification_userId_readAt_idx` ON `Notification`;

-- AlterTable
ALTER TABLE `Notification` DROP COLUMN `emailSentAt`,
    DROP COLUMN `readAt`,
    ADD COLUMN `channel` VARCHAR(191) NOT NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Notification_channel_idx` ON `Notification`(`channel`);

-- CreateIndex
CREATE INDEX `Notification_userId_deliveredAt_idx` ON `Notification`(`userId`, `deliveredAt` DESC);
