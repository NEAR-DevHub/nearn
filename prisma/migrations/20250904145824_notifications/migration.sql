/*
  Warnings:

  - You are about to drop the `EmailSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emailLogs` table. If the table is not empty, all the data it contains will be lost.

*/

BEGIN;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `emailSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_eventId_idx`(`eventId`),
    INDEX `Notification_userId_readAt_idx`(`userId`, `readAt` DESC),
    INDEX `Notification_userId_emailSentAt_idx`(`userId`, `emailSentAt` DESC),
    INDEX `Notification_userId_createdAt_idx`(`userId`, `createdAt` DESC),
    INDEX `Notification_eventId_createdAt_idx`(`eventId`, `createdAt` DESC),
    INDEX `Notification_userId_eventId_idx`(`userId`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationSettings` (
    `id` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationSettings_userId_channel_type_idx`(`userId`, `channel`, `type`),
    INDEX `NotificationSettings_userId_idx`(`userId`),
    INDEX `NotificationSettings_channel_idx`(`channel`),
    INDEX `NotificationSettings_type_idx`(`type`),
    UNIQUE INDEX `NotificationSettings_userId_channel_type_key`(`userId`, `channel`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate data from EmailSettings to NotificationSettings
-- Each EmailSettings category becomes a NotificationSettings type with channel 'email'
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    'email' as `channel`,
    `category` as `type`,
    `userId`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `EmailSettings`;

-- DropTable
DROP TABLE `EmailSettings`;

-- DropTable
DROP TABLE `emailLogs`;

COMMIT;
