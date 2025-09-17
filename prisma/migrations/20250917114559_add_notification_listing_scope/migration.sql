/*
  Warnings:

  - A unique constraint covering the columns `[userId,channel,type,sponsorId]` on the table `NotificationSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `NotificationSettings_userId_channel_type_idx` ON `NotificationSettings`;

-- DropIndex
DROP INDEX `NotificationSettings_userId_channel_type_key` ON `NotificationSettings`;

-- AlterTable
ALTER TABLE `NotificationSettings` ADD COLUMN `listingScope` VARCHAR(191) NULL DEFAULT 'mine';

-- CreateIndex
CREATE INDEX `NotificationSettings_userId_channel_type_sponsorId_idx` ON `NotificationSettings`(`userId`, `channel`, `type`, `sponsorId`);

-- CreateIndex
CREATE UNIQUE INDEX `NotificationSettings_userId_channel_type_sponsorId_key` ON `NotificationSettings`(`userId`, `channel`, `type`, `sponsorId`);
