-- AlterTable - Add columns as nullable first
ALTER TABLE `Bounties` ADD COLUMN `multipleSubmissionRule` ENUM('immediately', 'afterReview') NULL,
    ADD COLUMN `submissionLimit` ENUM('single', 'multiple') NULL;

-- Update existing bounties and projects to have single submission limit
UPDATE `Bounties` 
SET `submissionLimit` = 'single'
WHERE `type` IN ('bounty', 'project', 'hackathon');

-- Update existing sponsorships to have multiple submission limit with afterReview rule
UPDATE `Bounties` 
SET `submissionLimit` = 'multiple', 
    `multipleSubmissionRule` = 'afterReview'
WHERE `type` = 'sponsorship';

-- Now make submissionLimit NOT NULL with default after data is populated
ALTER TABLE `Bounties` 
MODIFY COLUMN `submissionLimit` ENUM('single', 'multiple') NOT NULL DEFAULT 'single';
