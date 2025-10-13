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
    `listingScope` VARCHAR(191) NULL DEFAULT 'mine',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationSettings_userId_channel_type_sponsorId_idx`(`userId`, `channel`, `type`, `sponsorId`),
    INDEX `NotificationSettings_userId_idx`(`userId`),
    INDEX `NotificationSettings_channel_idx`(`channel`),
    INDEX `NotificationSettings_type_idx`(`type`),
    INDEX `NotificationSettings_sponsorId_idx`(`sponsorId`),
    UNIQUE INDEX `NotificationSettings_userId_channel_type_sponsorId_key`(`userId`, `channel`, `type`, `sponsorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate email settings to notification settings with proper type mapping
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    'email' as `channel`,
    CASE 
        WHEN `category` = 'commentOrLikeSubmission' THEN 'SUBMISSION_COMMENT'
        WHEN `category` = 'commentSponsor' THEN 'LISTING_COMMENT'
        WHEN `category` = 'createListing' THEN 'SUBMISSION_RECEIVED'
        WHEN `category` = 'deadlineSponsor' THEN 'DEADLINE_IN_3_DAYS'
        WHEN `category` = 'productAndNewsletter' THEN 'PRODUCT_UPDATES_AND_NEWS'
        WHEN `category` = 'replyOrTagComment' THEN 'COMMENT_REPLY'
        WHEN `category` = 'scoutInvite' THEN 'SCOUT_INVITE'
        WHEN `category` = 'submissionSponsor' THEN 'SUBMISSION_CREATED'
        WHEN `category` = 'weeklyListingRoundup' THEN 'WEEKLY_ROUNDUP'
    END as `type`,
    `userId`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `EmailSettings`
WHERE `category` IN ('commentOrLikeSubmission', 'commentSponsor', 'createListing', 'deadlineSponsor', 'productAndNewsletter', 'replyOrTagComment', 'scoutInvite', 'submissionSponsor', 'weeklyListingRoundup');

-- Handle categories that map to multiple notification types
-- commentOrLikeSubmission -> LIKE
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    'email' as `channel`,
    'LIKE' as `type`,
    `userId`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `EmailSettings`
WHERE `category` = 'commentOrLikeSubmission';

-- replyOrTagComment -> COMMENT_MENTIONED_YOU
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    'email' as `channel`,
    'COMMENT_MENTIONED_YOU' as `type`,
    `userId`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `EmailSettings`
WHERE `category` = 'replyOrTagComment';

-- Add inApp settings for sponsor alerts (with sponsorId and listingScope)
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `sponsorId`, `listingScope`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    'inApp' as `channel`,
    notification_type as `type`,
    us.userId as `userId`,
    us.sponsorId as `sponsorId`,
    'mine' as `listingScope`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `UserSponsors` us
CROSS JOIN (
    SELECT 'SUBMISSION_CREATED' as notification_type
    UNION SELECT 'SUBMISSION_EDITED'
    UNION SELECT 'LISTING_COMMENT'
    UNION SELECT 'NOTE_CREATED'
    UNION SELECT 'TREASURY_PROPOSAL_STATUS_CHANGED'
    UNION SELECT 'SPONSOR_MEMBER_ACCEPTED'
    UNION SELECT 'DEADLINE_EXCEEDED_BY_WEEK'
) as notification_types;

-- Add email settings for sponsor alerts (with sponsorId and listingScope) based on old settings
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `sponsorId`, `listingScope`, `createdAt`, `updatedAt`)
SELECT DISTINCT
    UUID() as `id`,
    'email' as `channel`,
    CASE 
        WHEN es.category = 'submissionSponsor' THEN 'SUBMISSION_CREATED'
        WHEN es.category = 'commentSponsor' THEN 'LISTING_COMMENT'
        WHEN es.category = 'deadlineSponsor' THEN 'DEADLINE_EXCEEDED_BY_WEEK'
    END as `type`,
    es.userId as `userId`,
    us.sponsorId as `sponsorId`,
    'mine' as `listingScope`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `EmailSettings` es
INNER JOIN `UserSponsors` us ON es.userId = us.userId
WHERE es.category IN ('submissionSponsor', 'commentSponsor', 'deadlineSponsor');

-- Add inApp settings for talent/general alerts (without sponsorId)
INSERT INTO `NotificationSettings` (`id`, `channel`, `type`, `userId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    'inApp' as `channel`,
    notification_type as `type`,
    u.id as `userId`,
    NOW() as `createdAt`,
    NOW() as `updatedAt`
FROM `User` u
CROSS JOIN (
    -- Talent alerts
    SELECT 'SUBMISSION_COMMENT' as notification_type
    UNION SELECT 'POW_COMMENT'
    UNION SELECT 'SUBMISSION_APPROVED'
    UNION SELECT 'SUBMISSION_REJECTED'
    UNION SELECT 'SUBMISSION_PAID'
    UNION SELECT 'DEADLINE_IN_3_DAYS'
    UNION SELECT 'LISTING_WINNERS_ANNOUNCED'
    UNION SELECT 'LISTING_EDITED'
    UNION SELECT 'NEW_LISTING_FOR_SKILLS'
    UNION SELECT 'WEEKLY_ROUNDUP'
    UNION SELECT 'SCOUT_INVITE'
    -- General alerts
    UNION SELECT 'COMMENT_REPLY'
    UNION SELECT 'COMMENT_MENTIONED_YOU'
    UNION SELECT 'COMMENT_PINNED'
    UNION SELECT 'LIKE'
    UNION SELECT 'PRODUCT_UPDATES_AND_NEWS'
    -- Special type that might be needed
    UNION SELECT 'SUBMISSION_RECEIVED'
    UNION SELECT 'SPONSOR_MEMBER_INVITED'
) as notification_types;

-- CreateIndex
CREATE INDEX `EventLog_powId_eventTime_idx` ON `EventLog`(`powId`, `eventTime` DESC);

-- DropTable
DROP TABLE `EmailSettings`;

-- DropTable
DROP TABLE `emailLogs`;
