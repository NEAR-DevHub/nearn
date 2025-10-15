/*
  Warnings:

  - You are about to drop the column `isPaid` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `paidBy` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDetails` on the `Submission` table. All the data in the column will be lost.
*/

BEGIN;

-- CreateTable
CREATE TABLE `Milestone` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `milestoneIndex` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `deadline` DATETIME(3) NULL,
    `reward` DOUBLE NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `status` ENUM('NotStarted', 'Pending', 'Approved', 'Paid', 'Rejected') NOT NULL DEFAULT 'NotStarted',
    `paymentDetails` JSON NULL,
    `paidDate` DATETIME(3) NULL,
    `approvedDate` DATETIME(3) NULL,
    `paidBy` VARCHAR(191) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Milestone_submissionId_idx`(`submissionId`),
    INDEX `Milestone_status_idx`(`status`),
    INDEX `Milestone_deadline_idx`(`deadline`),
    INDEX `Milestone_paidBy_idx`(`paidBy`),
    INDEX `Milestone_approvedBy_idx`(`approvedBy`),
    UNIQUE INDEX `Milestone_submissionId_milestoneIndex_key`(`submissionId`, `milestoneIndex`),
    INDEX `Milestone_createdAt_idx`(`createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate data from Submission to Milestone for all Approved submissions
INSERT INTO `Milestone` (
    `id`,
    `submissionId`,
    `milestoneIndex`,
    `title`,
    `deadline`,
    `reward`,
    `token`,
    `status`,
    `paymentDetails`,
    `paidDate`,
    `approvedDate`,
    `paidBy`,
    `approvedBy`,
    `createdAt`,
    `updatedAt`
)
SELECT 
    UUID() as `id`,
    s.`id` as `submissionId`,
    0 as `milestoneIndex`,
    CONCAT('Payment for submission #', s.`sequentialId`) as `title`,
    COALESCE(b.`deadline`, DATE_ADD(NOW(), INTERVAL 30 DAY)) as `deadline`,
    COALESCE(s.`rewardInUSD`, s.`ask`, b.`rewardAmount`, b.`usdValue`, 0) as `reward`,
    CASE 
        WHEN b.`token` = 'Any' THEN s.`token`
        ELSE b.`token`
    END as `token`,
    CASE 
        WHEN s.`isPaid` = 1 THEN 'Paid'
        ELSE 'Approved'
    END as `status`,
    s.`paymentDetails`,
    s.`paymentDate` as `paidDate`,
    s.`approveDate` as `approvedDate`,
    s.`paidBy`,
    s.`approvedBy`,
    s.`createdAt`,
    NOW() as `updatedAt`
FROM `Submission` s
JOIN `Bounties` b ON s.`listingId` = b.`id`
WHERE s.`status` = 'Approved';

-- DropIndex
DROP INDEX `Submission_paidBy_idx` ON `Submission`;

-- AlterTable
ALTER TABLE `Submission` DROP COLUMN `isPaid`,
    DROP COLUMN `paidBy`,
    DROP COLUMN `paymentDate`,
    DROP COLUMN `paymentDetails`;

-- Drop existing view
DROP VIEW IF EXISTS `BountyCounts`;

-- Recreate view with new logic
CREATE VIEW `BountyCounts` AS
  SELECT
    b.id AS bountyId,
    COUNT(CASE WHEN s.isWinner = TRUE THEN 1 END) AS totalWinnersSelected,
    COUNT(CASE 
        WHEN s.isWinner = TRUE 
        AND NOT EXISTS (
            SELECT 1 
            FROM Milestone m 
            WHERE m.submissionId = s.id 
            AND m.status != 'Paid'
        )
        THEN 1 
    END) AS totalPaymentsMade
  FROM Bounties b
  LEFT JOIN Submission s ON s.listingId = b.id
  GROUP BY b.id;

COMMIT;
