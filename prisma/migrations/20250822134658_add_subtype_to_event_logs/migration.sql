-- AlterTable
ALTER TABLE `EventLog` ADD COLUMN `subType` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `EventLog_subType_eventTime_idx` ON `EventLog`(`subType`, `eventTime` DESC);
