import { type NotificationRelationType } from '@prisma/client';

import { type User } from '@/interface/user';

import { type NotificationType } from '@/features/notifications/types';

import { sections } from '../constants';
import { AlertCategory, type NotificationState } from '../types';

export const transformToApiFormat = (
  notificationState: NotificationState,
  user: User,
) => {
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

    Object.entries(settingStore).forEach(([sponsorKey, setting]) => {
      if (
        sponsorKey === 'general' &&
        category === AlertCategory.SPONSOR &&
        user?.UserSponsors?.length &&
        user.UserSponsors.length > 0
      ) {
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
