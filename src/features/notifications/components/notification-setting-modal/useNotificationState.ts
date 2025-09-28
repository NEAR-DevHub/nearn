import {
  type NotificationRelationType,
  type NotificationSettings,
} from '@prisma/client';
import { useEffect, useState } from 'react';

import { type User } from '@/interface/user';
import { type UserSponsor } from '@/interface/userSponsor';

import { type NotificationType } from '../../types';
import { sections } from './constants';
import { AlertCategory, type NotificationSetting } from './types';

interface NotificationStore {
  general: NotificationSetting;
  [key: string]: NotificationSetting;
}

interface NotificationState {
  [key: string]: NotificationStore;
}

export const useNotificationState = (user: User) => {
  const [notificationState, setNotificationState] = useState<NotificationState>(
    {},
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notification state from user's current settings
  useEffect(() => {
    if (!user || isInitialized) return;

    const newState: NotificationState = {};

    // First, initialize all sections with default values
    Object.entries(sections).forEach(([category, sectionItems]) => {
      sectionItems.forEach((item, index) => {
        const key = `${category}-${index}`;
        const types = (
          'types' in item ? item.types : [item.type]
        ) as NotificationType[];

        const userData = user.NotificationSettings?.filter((setting: any) =>
          types.includes(setting.type),
        );
        if (userData) {
          newState[key] = {
            general: {
              email: userData.some(
                (setting: NotificationSettings) =>
                  setting.channel === 'email' && !setting.sponsorId,
              ),
              inApp: userData.some(
                (setting: NotificationSettings) =>
                  setting.channel === 'inApp' && !setting.sponsorId,
              ),
              listingScope: userData.find(
                (setting: NotificationSettings) =>
                  setting.listingScope && !setting.sponsorId,
              )?.listingScope as unknown as 'mine' | 'all',
            },
          };
        } else {
          newState[key] = {
            general: { email: false, inApp: false, listingScope: 'mine' },
          };
        }

        // If this is a sponsor category and user has sponsors, initialize sponsor-specific settings
        if (
          category === AlertCategory.SPONSOR &&
          user?.UserSponsors &&
          user.UserSponsors.length > 0
        ) {
          user.UserSponsors.forEach((userSponsor: UserSponsor) => {
            if (userData) {
              newState[key]![userSponsor?.sponsorId ?? 'general'] = {
                email: userData.some(
                  (setting: NotificationSettings) =>
                    setting.channel === 'email' &&
                    setting.sponsorId === userSponsor.sponsorId,
                ),
                inApp: userData.some(
                  (setting: NotificationSettings) =>
                    setting.channel === 'inApp' &&
                    setting.sponsorId === userSponsor.sponsorId,
                ),
                listingScope: userData.find(
                  (setting: NotificationSettings) =>
                    setting.listingScope &&
                    setting.sponsorId === userSponsor.sponsorId,
                )?.listingScope as unknown as 'mine' | 'all',
              };
            } else {
              newState[key]![userSponsor?.sponsorId ?? 'general'] = {
                email: false,
                inApp: false,
                listingScope: 'mine',
              };
            }
          });
        }
      });
    });

    setNotificationState(newState);
    setIsInitialized(true);
  }, [user, isInitialized]);

  const getNotificationSetting = (
    category: string,
    id: number,
    sponsorId?: string,
  ): NotificationSetting => {
    const setting =
      notificationState[`${category}-${id}`] ??
      ({
        general: { email: false, inApp: false, listingScope: 'mine' },
      } as NotificationStore);

    if (sponsorId) {
      return setting[sponsorId] ?? setting.general;
    }
    return setting.general;
  };

  const updateSetting = (
    category: string,
    id: number,
    updateSetting: Partial<NotificationSetting>,
    sponsorId?: string,
  ) => {
    const key = `${category}-${id}`;

    let setting = notificationState[key] ?? {
      general: { email: false, inApp: false, listingScope: 'mine' },
    };
    if (sponsorId) {
      // Update specific sponsor
      const sponsorSetting = setting[sponsorId] ?? {
        email: false,
        inApp: false,
        listingScope: 'mine',
      };
      setting = {
        ...setting,
        [sponsorId]: { ...sponsorSetting, ...updateSetting },
      } as NotificationStore;
    } else {
      // Update general and all sponsors
      const updatedSetting = {
        ...setting,
        general: { ...setting.general, ...updateSetting },
      } as NotificationStore;

      // If updating general category for SPONSOR type, update all sponsor settings too
      if (category === AlertCategory.SPONSOR && user?.UserSponsors) {
        user.UserSponsors.forEach((userSponsor: any) => {
          const sponsorSetting = updatedSetting[userSponsor.sponsorId] ?? {
            email: false,
            inApp: false,
            listingScope: 'mine',
          };
          updatedSetting[userSponsor.sponsorId] = {
            ...sponsorSetting,
            ...updateSetting,
          };
        });
      }

      setting = updatedSetting;
    }

    setNotificationState((prev) => {
      return {
        ...prev,
        [key]: setting,
      };
    });
  };

  const transformToApiFormat = () => {
    const result: any[] = [];

    Object.entries(notificationState).forEach(([key, settingStore]) => {
      const [category, id] = key.split('-');
      const section =
        sections[category as NotificationRelationType] ||
        sections[category as 'GENERAL'];
      if (!section) return;

      const sectionItem = section[Number(id)];
      if (!sectionItem) return;

      const types = (
        'types' in sectionItem ? sectionItem.types : [sectionItem.type]
      ) as NotificationType[];

      // Process all sponsor-specific settings
      Object.entries(settingStore).forEach(([sponsorKey, setting]) => {
        if (
          sponsorKey === 'general' &&
          category === AlertCategory.SPONSOR &&
          user?.UserSponsors?.length &&
          user.UserSponsors.length > 0
        ) {
          // Skip general setting if there are sponsor-specific settings
          return;
        }

        const sponsorId = sponsorKey === 'general' ? undefined : sponsorKey;

        types.forEach((type: NotificationType) => {
          if (setting.email) {
            result.push({
              channel: 'email',
              type,
              sponsorId,
              listingScope:
                category === AlertCategory.SPONSOR
                  ? setting.listingScope
                  : undefined,
            });
          }
          if (setting.inApp) {
            result.push({
              channel: 'inApp',
              type,
              sponsorId,
              listingScope:
                category === AlertCategory.SPONSOR
                  ? setting.listingScope
                  : undefined,
            });
          }
        });
      });
    });

    return result;
  };

  const getGeneralCheckboxState = (
    category: string,
    id: number,
    channel: string,
  ): { checked: boolean; indeterminate: boolean } => {
    const key = `${category}-${id}`;
    const setting = notificationState[key];

    if (
      !setting ||
      category !== AlertCategory.SPONSOR ||
      !user?.UserSponsors ||
      user.UserSponsors.length === 0
    ) {
      const generalSetting = getNotificationSetting(category, id);
      return {
        checked:
          channel === 'email' ? generalSetting.email : generalSetting.inApp,
        indeterminate: false,
      };
    }

    // Check all sponsor settings for this channel
    const sponsorStates = user.UserSponsors.map((userSponsor: any) => {
      const sponsorSetting = setting[userSponsor.sponsorId] || setting.general;
      return channel === 'email' ? sponsorSetting.email : sponsorSetting.inApp;
    });

    const allChecked = sponsorStates.every((state) => state === true);
    const someChecked = sponsorStates.some((state) => state === true);

    return {
      checked: allChecked,
      indeterminate: someChecked && !allChecked,
    };
  };

  const getGeneralListingScope = (
    category: string,
    id: number,
  ): 'mine' | 'all' | 'mixed' => {
    const key = `${category}-${id}`;
    const setting = notificationState[key];

    if (
      !setting ||
      category !== AlertCategory.SPONSOR ||
      !user?.UserSponsors ||
      user.UserSponsors.length === 0
    ) {
      const generalSetting = getNotificationSetting(category, id);
      return generalSetting.listingScope;
    }

    // Check all sponsor settings for listingScope
    const sponsorScopes = user.UserSponsors.map((userSponsor: any) => {
      const sponsorSetting = setting[userSponsor.sponsorId] || setting.general;
      return sponsorSetting.listingScope ?? 'mine';
    });

    const allMine = sponsorScopes.every((scope) => scope === 'mine');
    const allAll = sponsorScopes.every((scope) => scope === 'all');

    if (allMine) return 'mine';
    if (allAll) return 'all';
    return 'mixed';
  };

  return {
    getNotificationSetting,
    updateSetting,
    transformToApiFormat,
    getGeneralCheckboxState,
    getGeneralListingScope,
    isInitialized,
  };
};
