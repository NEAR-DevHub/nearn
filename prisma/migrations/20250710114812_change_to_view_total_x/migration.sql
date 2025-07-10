/*
  Warnings:

  - You are about to drop the column `totalPaymentsMade` on the `Bounties` table. All the data in the column will be lost.
  - You are about to drop the column `totalWinnersSelected` on the `Bounties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Bounties` DROP COLUMN `totalPaymentsMade`,
    DROP COLUMN `totalWinnersSelected`;

CREATE VIEW `BountyCounts` AS
  SELECT
    b.id                                        AS bountyId,
    COUNT(CASE WHEN s.isWinner = TRUE THEN 1 END) AS totalWinnersSelected,
    COUNT(CASE WHEN s.isPaid   = TRUE THEN 1 END) AS totalPaymentsMade
  FROM Bounties b
  LEFT JOIN Submission s ON s.listingId = b.id
  GROUP BY b.id;
