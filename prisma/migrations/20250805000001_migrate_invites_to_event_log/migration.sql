-- This migration populates the EventLog table with historical invite and member data

-- Migrate UserSponsors join events to SPONSOR_MEMBER_ACCEPTED
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
    NULL as `listingId`,
    NULL as `submissionId`,
    us.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'SPONSOR_MEMBER_ACCEPTED' as `eventType`,
    us.userId as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT(
        'role', us.role
    ) as `data`,
    us.createdAt as `eventTime`,
    'SPONSOR' as `visibility`,
    us.createdAt as `createdAt`
FROM `UserSponsors` us
WHERE NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.actorId = us.userId 
    AND el.sponsorId = us.sponsorId 
    AND el.eventType = 'SPONSOR_MEMBER_ACCEPTED'
    AND DATE(el.eventTime) = DATE(us.createdAt)
);

-- Migrate UserInvites to SPONSOR_MEMBER_INVITED events
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
    NULL as `listingId`,
    NULL as `submissionId`,
    ui.sponsorId as `sponsorId`,
    NULL as `commentId`,
    'SPONSOR_MEMBER_INVITED' as `eventType`,
    ui.senderId as `actorId`,
    'SPONSOR' as `actorType`,
    JSON_OBJECT(
        'invitedEmail', ui.email,
        'invitedUserId', (SELECT id FROM `User` u WHERE u.email = ui.email LIMIT 1),
        'role', ui.memberType
    ) as `data`,
    ui.createdAt as `eventTime`,
    'SPONSOR' as `visibility`,
    ui.createdAt as `createdAt`
FROM `UserInvites` ui
WHERE NOT EXISTS (
    SELECT 1 FROM `EventLog` el 
    WHERE el.actorId = ui.senderId
    AND el.sponsorId = ui.sponsorId 
    AND el.eventType = 'SPONSOR_MEMBER_INVITED'
    AND JSON_EXTRACT(el.data, '$.invitedEmail') = ui.email
    AND DATE(el.eventTime) = DATE(ui.createdAt)
);