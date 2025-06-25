-- AlterTable
ALTER TABLE `Submission` ADD COLUMN `approveDate` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` VARCHAR(191) NULL,
    ADD COLUMN `paidBy` VARCHAR(191) NULL;


UPDATE Submission s
JOIN User u ON s.userId = u.id
INNER JOIN (
    SELECT 
        c.refId as listingId,
        c.createdAt as announcementDate,
        c.authorId as announcementUserId,
        c.message as message
    FROM Comment c
    WHERE c.type = 'WINNER_ANNOUNCEMENT' 
    AND c.refType = 'BOUNTY'
    ORDER BY c.createdAt 
) announcement ON s.listingId = announcement.listingId 
  and announcement.message LIKE CONCAT('%', u.username, '%')
  AND announcement.announcementDate between s.createdAt and DATE_ADD(s.createdAT, interval 7 Day) 
SET s.approveDate = announcement.announcementDate, s.approvedBy = announcement.announcementUserId
WHERE s.status = 'Approved'
