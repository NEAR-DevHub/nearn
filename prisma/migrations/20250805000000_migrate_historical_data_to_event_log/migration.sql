-- This migration populates the EventLog table with historical data
SET SESSION group_concat_max_len = 100000;
-- Migrate existing comments to COMMENT_ADDED events
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    CASE 
        WHEN c.refType = 'BOUNTY' THEN c.refId
        WHEN c.refType = 'SUBMISSION' THEN s.listingId
        ELSE NULL
    END as `listingId`,
    CASE 
        WHEN c.refType = 'SUBMISSION' THEN c.refId
        ELSE NULL
    END as `submissionId`,
    CASE 
        WHEN c.refType = 'BOUNTY' THEN b.sponsorId
        WHEN c.refType = 'SUBMISSION' THEN b2.sponsorId
        ELSE NULL
    END as `sponsorId`,
    c.id as `commentId`,
    'COMMENT_ADDED' as `eventType`,
    c.authorId as `actorId`,
    'USER' as `actorType`,
    JSON_OBJECT() as `data`,
    c.createdAt as `eventTime`,
    'PUBLIC' as `visibility`,
    c.createdAt as `createdAt`
FROM `Comment` c
LEFT JOIN `Submission` s ON c.refType = 'SUBMISSION' AND c.refId = s.id
LEFT JOIN `Bounties` b ON c.refType = 'BOUNTY' AND c.refId = b.id
LEFT JOIN `Bounties` b2 ON s.listingId = b2.id
WHERE c.isActive = true AND c.isArchived = false AND (c.refType = 'SUBMISSION' OR c.refType = 'BOUNTY') AND (c.type = 'NORMAL' OR c.type = 'SUBMISSION')
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.commentId = c.id AND el.eventType = 'COMMENT_ADDED'
);

-- Migrate existing submissions to SUBMISSION_CREATED events
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    s.listingId as `listingId`,
    s.id as `submissionId`,
    b.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'SUBMISSION_CREATED' as `eventType`,
    s.userId as `actorId`,
    'TALENT' as `actorType`,
    JSON_OBJECT() as `data`,
    s.createdAt as `eventTime`,
    'PUBLIC' as `visibility`,
    s.createdAt as `createdAt`
FROM `Submission` s
INNER JOIN `Bounties` b ON s.listingId = b.id
WHERE s.isActive = true AND s.isArchived = false
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.submissionId = s.id AND el.eventType = 'SUBMISSION_CREATED'
);

-- Migrate existing published bounties to LISTING_PUBLISHED events
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    b.id as `listingId`,
    NULL as `submissionId`,
    b.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'LISTING_PUBLISHED' as `eventType`,
    b.pocId as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT() as `data`,
    COALESCE(b.publishedAt, b.createdAt) as `eventTime`,
    'PUBLIC' as `visibility`,
    COALESCE(b.publishedAt, b.createdAt) as `createdAt`
FROM `Bounties` b
WHERE b.isPublished = true 
AND b.publishedAt IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.listingId = b.id AND el.eventType = 'LISTING_PUBLISHED'
);

-- Migrate winner announcements
-- Note: Due to MySQL limitations with JSON_ARRAY and subqueries,
-- we'll create a simpler structure for winners data
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    b.id as `listingId`,
    NULL as `submissionId`,
    b.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'LISTING_WINNERS_ANNOUNCED' as `eventType`,
    b.pocId as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT(
        'winners', 
        CAST(CONCAT('[', 
            GROUP_CONCAT(
                JSON_OBJECT(
                    'submissionId', s.id,
                    'position', s.winnerPosition
                )
                ORDER BY s.winnerPosition
                SEPARATOR ','
            ),
        ']') AS JSON)
    ) as `data`,
    COALESCE(b.winnersAnnouncedAt, b.updatedAt) as `eventTime`,
    'PUBLIC' as `visibility`,
    COALESCE(b.winnersAnnouncedAt, b.updatedAt) as `createdAt`
FROM `Bounties` b
INNER JOIN `Submission` s ON s.listingId = b.id 
    AND s.isWinner = true 
    AND s.winnerPosition IS NOT NULL
WHERE b.isWinnersAnnounced = true
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.listingId = b.id AND el.eventType = 'LISTING_WINNERS_ANNOUNCED'
)
GROUP BY b.id, b.sponsorId, b.pocId, b.winnersAnnouncedAt, b.updatedAt;

-- Migrate approved submissions
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    s.listingId as `listingId`,
    s.id as `submissionId`,
    b.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'SUBMISSION_APPROVED' as `eventType`,
    s.approvedBy as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT('position', COALESCE(s.winnerPosition, 1)) as `data`,
    COALESCE(s.approveDate, s.updatedAt) as `eventTime`,
    'PUBLIC' as `visibility`,
    COALESCE(s.approveDate, s.updatedAt) as `createdAt`
FROM `Submission` s
INNER JOIN `Bounties` b ON s.listingId = b.id
WHERE s.status = 'Approved' and s.approvedBy is not null
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.submissionId = s.id AND el.eventType = 'SUBMISSION_APPROVED'
);

-- Migrate paid submissions
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    s.listingId as `listingId`,
    s.id as `submissionId`,
    b.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'SUBMISSION_PAID' as `eventType`,
    s.paidBy as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT(
        'link', 
        COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT(s.paymentDetails, '$.link')),
            ''
        )
    ) as `data`,
    COALESCE(s.paymentDate, s.updatedAt) as `eventTime`,
    'PUBLIC' as `visibility`,
    COALESCE(s.paymentDate, s.updatedAt) as `createdAt`
FROM `Submission` s
INNER JOIN `Bounties` b ON s.listingId = b.id
WHERE s.isPaid = true and s.paidBy is not null
AND s.paymentDate IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.submissionId = s.id AND el.eventType = 'SUBMISSION_PAID'
);

-- Migrate DEADLINE_EXTENSION comments to LISTING_EDITED events
-- These comments follow the format: "The deadline for this listing has been updated to X"
INSERT INTO `EventLog` (
    `id`,
    `listingId`,
    `submissionId`,
    `sponsorId`,
    `commentId`,
    `eventType`,
    `actorId`,
    `actorType`,
    `data`,
    `eventTime`,
    `visibility`,
    `createdAt`
)
SELECT 
    UUID() as `id`,
    c.refId as `listingId`,
    NULL as `submissionId`,
    b.sponsorId as `sponsorId`,
    c.id as `commentId`,
    'LISTING_EDITED' as `eventType`,
    c.authorId as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT(
        'changes', JSON_ARRAY(
            JSON_OBJECT(
                'field', 'deadline',
                'oldValue', NULL,
                'newValue', REGEXP_SUBSTR(c.message, '[0-9]{1,2}:[0-9]{2} [AP]M, [A-Za-z]+ [0-9]{1,2}, [0-9]{4}')
            )
        )
    ) as `data`,
    c.createdAt as `eventTime`,
    'PUBLIC' as `visibility`,
    c.createdAt as `createdAt`
FROM `Comment` c
INNER JOIN `Bounties` b ON c.refId = b.id
WHERE c.type = 'DEADLINE_EXTENSION'
AND c.refType = 'BOUNTY'
AND c.isActive = true 
AND c.isArchived = false
AND NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.commentId = c.id AND el.eventType = 'LISTING_EDITED'
);
