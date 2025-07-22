-- CreateTable
CREATE TABLE `EventLog` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NULL,
    `submissionId` VARCHAR(191) NULL,
    `sponsorId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `eventCategory` ENUM('SPONSOR', 'SUBMISSION', 'LISTING', 'COMMENT', 'TREASURY', 'SYSTEM') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `actorType` ENUM('SPONSOR', 'TALENT', 'PLATFORM_ADMIN', 'SYSTEM', 'USER') NOT NULL,
    `data` JSON NOT NULL,
    `eventTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `visibility` ENUM('PUBLIC', 'TALENT', 'SPONSOR', 'PLATFORM_ADMIN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EventLog_listingId_eventTime_idx`(`listingId`, `eventTime` DESC),
    INDEX `EventLog_submissionId_eventTime_idx`(`submissionId`, `eventTime` DESC),
    INDEX `EventLog_sponsorId_eventTime_idx`(`sponsorId`, `eventTime` DESC),
    INDEX `EventLog_actorId_eventTime_idx`(`actorId`, `eventTime` DESC),
    INDEX `EventLog_eventType_eventTime_idx`(`eventType`, `eventTime` DESC),
    INDEX `EventLog_visibility_eventTime_idx`(`visibility`, `eventTime` DESC),
    INDEX `EventLog_eventCategory_eventType_eventTime_idx`(`eventCategory`, `eventType`, `eventTime` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
