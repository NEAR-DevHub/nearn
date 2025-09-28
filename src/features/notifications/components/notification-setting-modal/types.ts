export interface NotificationSetting {
  email: boolean;
  inApp: boolean;
  listingScope: 'mine' | 'all';
}

export enum AlertCategory {
  SPONSOR = 'SPONSOR',
  TALENT = 'TALENT',
  GENERAL = 'GENERAL',
}
