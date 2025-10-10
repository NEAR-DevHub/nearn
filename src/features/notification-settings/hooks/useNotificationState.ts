import { type NotificationSettings } from '@prisma/client';
import { useEffect, useState } from 'react';

import { type User } from '@/interface/user';
import { type UserSponsor } from '@/interface/userSponsor';

import { type NotificationType } from '@/features/notifications/types';

import { sections } from '../constants';
import {
  AlertCategory,
  AlertChannel,
  ListingScope,
  type NotificationSetting,
  type NotificationState,
  type NotificationStore,
} from '../types';

export type UseNotificationStateReturn = ReturnType<
  typeof useNotificationState
>;

export const useNotificationState = (user?: User | null) => {
  const [notificationState, setNotificationState] = useState<NotificationState>(
    {},
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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
              [AlertChannel.EMAIL]: userData.some(
                (setting: NotificationSettings) =>
                  setting.channel === AlertChannel.EMAIL && !setting.sponsorId,
              ),
              [AlertChannel.IN_APP]: userData.some(
                (setting: NotificationSettings) =>
                  setting.channel === AlertChannel.IN_APP && !setting.sponsorId,
              ),
              listingScope: userData.find(
                (setting: NotificationSettings) =>
                  setting.listingScope && !setting.sponsorId,
              )?.listingScope as unknown as ListingScope,
            },
          };
        } else {
          newState[key] = {
            general: {
              [AlertChannel.EMAIL]: false,
              [AlertChannel.IN_APP]: false,
              listingScope: ListingScope.MINE,
            },
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
                [AlertChannel.EMAIL]: userData.some(
                  (setting: NotificationSettings) =>
                    setting.channel === AlertChannel.EMAIL &&
                    setting.sponsorId === userSponsor.sponsorId,
                ),
                [AlertChannel.IN_APP]: userData.some(
                  (setting: NotificationSettings) =>
                    setting.channel === AlertChannel.IN_APP &&
                    setting.sponsorId === userSponsor.sponsorId,
                ),
                listingScope: userData.find(
                  (setting: NotificationSettings) =>
                    setting.listingScope &&
                    setting.sponsorId === userSponsor.sponsorId,
                )?.listingScope as unknown as ListingScope,
              };
            } else {
              newState[key]![userSponsor?.sponsorId ?? 'general'] = {
                [AlertChannel.EMAIL]: false,
                [AlertChannel.IN_APP]: false,
                listingScope: ListingScope.MINE,
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
        general: {
          [AlertChannel.EMAIL]: false,
          [AlertChannel.IN_APP]: false,
          listingScope: ListingScope.MINE,
        },
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
      general: {
        [AlertChannel.EMAIL]: false,
        [AlertChannel.IN_APP]: false,
        listingScope: ListingScope.MINE,
      },
    };
    if (sponsorId) {
      // Update specific sponsor
      const sponsorSetting = setting[sponsorId] ?? {
        [AlertChannel.EMAIL]: false,
        [AlertChannel.IN_APP]: false,
        listingScope: ListingScope.MINE,
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
            [AlertChannel.EMAIL]: false,
            [AlertChannel.IN_APP]: false,
            listingScope: ListingScope.MINE,
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
          channel === AlertChannel.EMAIL
            ? generalSetting.email
            : generalSetting.inApp,
        indeterminate: false,
      };
    }

    // Check all sponsor settings for this channel
    const sponsorStates = user.UserSponsors.map((userSponsor: any) => {
      const sponsorSetting = setting[userSponsor.sponsorId] || setting.general;
      return channel === AlertChannel.EMAIL
        ? sponsorSetting.email
        : sponsorSetting.inApp;
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
  ): ListingScope | 'mixed' => {
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
      return sponsorSetting.listingScope ?? ListingScope.MINE;
    });

    const allMine = sponsorScopes.every((scope) => scope === ListingScope.MINE);
    const allAll = sponsorScopes.every((scope) => scope === ListingScope.ALL);

    if (allMine) return ListingScope.MINE;
    if (allAll) return ListingScope.ALL;
    return 'mixed';
  };

  return {
    notificationState,
    getNotificationSetting,
    updateSetting,
    getGeneralCheckboxState,
    getGeneralListingScope,
    isInitialized,
  };
};
