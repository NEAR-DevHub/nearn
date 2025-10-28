/*
  Warnings:

  - The values [InReview] on the enum `Milestone_status` will be removed. If these variants are still used in the database, this will fail.

*/

-- Step 1: Add InProgress to the enum (keeping InReview temporarily)
ALTER TABLE `Milestone` MODIFY `status` ENUM('NotStarted', 'InReview', 'InProgress', 'Approved', 'Paid', 'Cancelled') NOT NULL DEFAULT 'NotStarted';

-- Step 2: Migrate all InReview records to InProgress
UPDATE `Milestone` SET `status` = 'InProgress' WHERE `status` = 'InReview';

-- Step 3: Remove InReview from the enum
ALTER TABLE `Milestone` MODIFY `status` ENUM('NotStarted', 'InProgress', 'Approved', 'Paid', 'Cancelled') NOT NULL DEFAULT 'NotStarted';
