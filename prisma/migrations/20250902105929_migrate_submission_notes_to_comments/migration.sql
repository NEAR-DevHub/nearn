/*
  Warnings:

  - You are about to drop the column `notes` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable

BEGIN;
ALTER TABLE `Comment` MODIFY `type` ENUM('NORMAL', 'SUBMISSION', 'DEADLINE_EXTENSION', 'WINNER_ANNOUNCEMENT', 'INTERNAL_SUBMISSION_NOTES') NOT NULL DEFAULT 'NORMAL';

ALTER TABLE `Comment` MODIFY `authorId` VARCHAR(191) NULL;

-- Migrate existing notes to comments
INSERT INTO `Comment` (`id`, `message`, `refType`, `refId`, `type`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as `id`,
    s.notes as `message`,
    'SUBMISSION' as `refType`,
    s.id as `refId`,
    'INTERNAL_SUBMISSION_NOTES' as `type`,
    now() as `createdAt`,
    now() as `updatedAt`
FROM Submission s
WHERE s.notes IS NOT NULL AND s.notes != '';

-- AlterTable
ALTER TABLE Submission DROP COLUMN notes;

COMMIT;
