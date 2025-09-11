/*
  Warnings:

  - You are about to drop the `EmailSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emailLogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `EventLog` ADD COLUMN `powId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `data` JSON NULL,
    `actorId` VARCHAR(191) NULL,
    `listingId` VARCHAR(191) NULL,
    `submissionId` VARCHAR(191) NULL,
    `commentId` VARCHAR(191) NULL,
    `powId` VARCHAR(191) NULL,
    `sponsorId` VARCHAR(191) NULL,
    `notificationRelationType` ENUM('SPONSOR', 'TALENT') NOT NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_receiverId_idx`(`receiverId`),
    INDEX `Notification_actorId_idx`(`actorId`),
    INDEX `Notification_channel_idx`(`channel`),
    INDEX `Notification_listingId_idx`(`listingId`),
    INDEX `Notification_submissionId_idx`(`submissionId`),
    INDEX `Notification_commentId_idx`(`commentId`),
    INDEX `Notification_powId_idx`(`powId`),
    INDEX `Notification_sponsorId_idx`(`sponsorId`),
    INDEX `Notification_type_idx`(`type`),
    INDEX `Notification_receiverId_deliveredAt_idx`(`receiverId`, `deliveredAt` DESC),
    INDEX `Notification_receiverId_createdAt_idx`(`receiverId`, `createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationSettings` (
    `id` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sponsorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationSettings_userId_channel_type_idx`(`userId`, `channel`, `type`),
    INDEX `NotificationSettings_userId_idx`(`userId`),
    INDEX `NotificationSettings_channel_idx`(`channel`),
    INDEX `NotificationSettings_type_idx`(`type`),
    INDEX `NotificationSettings_sponsorId_idx`(`sponsorId`),
    UNIQUE INDEX `NotificationSettings_userId_channel_type_key`(`userId`, `channel`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateIndex
CREATE INDEX `EventLog_powId_eventTime_idx` ON `EventLog`(`powId`, `eventTime` DESC);
