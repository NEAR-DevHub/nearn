export enum ListingScope {
  MINE = 'mine',
  ALL = 'all',
}

export enum AlertChannel {
  EMAIL = 'email',
  IN_APP = 'inApp',
}

export interface NotificationSetting {
  email: boolean;
  inApp: boolean;
  listingScope: ListingScope;
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
