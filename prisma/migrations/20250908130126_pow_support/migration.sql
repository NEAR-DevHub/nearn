-- AlterTable
ALTER TABLE `EventLog` ADD COLUMN `powId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `EventLog_powId_eventTime_idx` ON `EventLog`(`powId`, `eventTime` DESC);
