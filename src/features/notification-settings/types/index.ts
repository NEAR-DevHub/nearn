export interface NotificationSetting {
  email: boolean;
  inApp: boolean;
  listingScope: 'mine' | 'all';
}

export interface NotificationStore {
  general: NotificationSetting;
  [key: string]: NotificationSetting;
}

export interface NotificationState {
  [key: string]: NotificationStore;
}

export enum AlertCategory {
  SPONSOR = 'SPONSOR',
  TALENT = 'TALENT',
  GENERAL = 'GENERAL',
}
