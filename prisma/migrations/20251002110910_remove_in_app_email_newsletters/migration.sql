DELETE FROM `NotificationSettings` WHERE 
`channel` = 'inApp' AND
(`type` = 'PRODUCT_UPDATES_AND_NEWS' OR `type` = 'WEEKLY_ROUNDUP' OR `type` = 'NEW_LISTING_FOR_SKILLS')
