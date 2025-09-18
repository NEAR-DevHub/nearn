import { NotificationRelationType } from '@prisma/client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type User } from '@/interface/user';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { EventType } from '@/features/logging/types/event-data';
import { NotificationType } from '@/features/notifications/types';
interface AlertOptionProps {
  title: string;
  channels: string[];
  disabled?: string[];
  alertType: 'SPONSOR' | 'TALENT' | 'GENERAL';
  alertId: number;
  userSponsors?: SponsorWithSettings[];
  isExpandable?: boolean;
  getNotificationSetting: (
    category: string,
    alertId: number,
    sponsorId?: string,
  ) => NotificationSetting;
  updateSetting: (
    category: string,
    alertId: number,
    setting: Partial<NotificationSetting>,
    sponsorId?: string,
  ) => void;
  getGeneralCheckboxState?: (
    category: string,
    alertId: number,
    channel: string,
  ) => { checked: boolean; indeterminate: boolean };
  getGeneralListingScope?: (
    category: string,
    alertId: number,
  ) => 'mine' | 'all' | 'mixed';
}

interface SponsorWithSettings {
  id: string;
  name: string;
}

const sections = {
  [NotificationRelationType.SPONSOR]: [
    {
      title: 'New submissions received for listing',
      type: EventType.SUBMISSION_CREATED,
    },
    {
      title: 'Submission edited',
      type: EventType.SUBMISSION_EDITED,
    },
    {
      title: 'Comments received on listing',
      type: NotificationType.LISTING_COMMENT,
    },
    {
      title: 'Deadline related reminders',
      types: [NotificationType.DEADLINE_EXCEEDED_BY_WEEK],
    },
    {
      title: 'Notes received on submission',
      type: NotificationType.NOTE_CREATED,
    },
    {
      title: 'NEAR Treasury Related Notifications',
      types: [NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED],
    },
    {
      title: 'New member joined your team',
      type: NotificationType.SPONSOR_MEMBER_ACCEPTED,
    },
  ],
  [NotificationRelationType.TALENT]: [
    {
      title: 'New comments on my submission',
      type: NotificationType.SUBMISSION_COMMENT,
    },
    {
      title: 'My submission statuses',
      types: [
        NotificationType.SUBMISSION_APPROVED,
        NotificationType.SUBMISSION_REJECTED,
        NotificationType.SUBMISSION_PAID,
      ],
    },
    {
      title: 'Deadline related reminders',
      type: NotificationType.DEADLINE_IN_3_DAYS,
    },
    {
      title: 'Listing related notifications',
      types: [
        NotificationType.LISTING_WINNERS_ANNOUNCED,
        NotificationType.LISTING_EDITED,
      ],
    },
    {
      title: 'New listings added for my skills',
      type: NotificationType.NEW_LISTING_FOR_SKILLS,
      disabled: ['inApp'],
    },
    {
      title: 'Weekly roundup of new listings',
      type: NotificationType.WEEKLY_ROUNDUP,
      disabled: ['inApp'],
    },
    {
      title: 'New comments on my Proof of Work',
      type: NotificationType.POW_COMMENT,
    },
    {
      title: 'Scout invitation',
      types: [NotificationType.SCOUT_INVITE],
    },
  ],
  GENERAL: [
    {
      title: 'Comment replies, pinned and tags',
      types: [
        NotificationType.COMMENT_REPLY,
        NotificationType.COMMENT_MENTIONED_YOU,
        NotificationType.COMMENT_PINNED,
      ],
    },
    {
      title: 'Likes',
      type: NotificationType.LIKE,
    },
    {
      title: 'Product updates and newsletters',
      type: NotificationType.PRODUCT_UPDATES_AND_NEWS,
      disabled: ['inApp'],
    },
  ],
};

const AlertOption = ({
  title,
  channels,
  getNotificationSetting,
  updateSetting,
  alertType,
  alertId,
  userSponsors,
  isExpandable,
  disabled,
  getGeneralCheckboxState,
  getGeneralListingScope,
}: AlertOptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderCheckboxes = (currentSponsorId?: string) => (
    <>
      {alertType === 'SPONSOR' && (
        <div className="w-16">
          <Select
            value={(() => {
              if (!currentSponsorId && getGeneralListingScope && isExpandable) {
                return getGeneralListingScope(alertType, alertId);
              }
              return getNotificationSetting(
                alertType,
                alertId,
                currentSponsorId,
              ).listingScope;
            })()}
            onValueChange={(value) => {
              if (value === 'mixed') return;
              updateSetting(
                alertType,
                alertId,
                { listingScope: value as 'mine' | 'all' },
                currentSponsorId,
              );
            }}
          >
            <SelectTrigger className="w- h-8 w-fit gap-1 border-none p-0 text-sm text-slate-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mine">Mine</SelectItem>
              <SelectItem value="all">All</SelectItem>
              {!currentSponsorId && getGeneralListingScope && isExpandable && (
                <SelectItem value="mixed" className="hidden" disabled>
                  Mixed
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      {channels.map((channel) => {
        const setting = getNotificationSetting(
          alertType,
          alertId,
          currentSponsorId,
        );
        const checkboxState =
          !currentSponsorId && getGeneralCheckboxState && isExpandable
            ? getGeneralCheckboxState(alertType, alertId, channel)
            : {
                checked: channel === 'email' ? setting.email : setting.inApp,
                indeterminate: false,
              };

        return (
          <div key={channel} className="flex w-12 justify-center">
            <Checkbox
              className="data-[state=unchecked]:border-slate-200 disabled:bg-slate-100"
              checked={
                checkboxState.indeterminate
                  ? 'indeterminate'
                  : checkboxState.checked
              }
              disabled={disabled?.includes(channel)}
              onCheckedChange={(checked) => {
                const updateSettingData =
                  channel === 'email'
                    ? { email: checked as boolean }
                    : { inApp: checked as boolean };
                updateSetting(
                  alertType,
                  alertId,
                  updateSettingData,
                  currentSponsorId,
                );
              }}
            />
          </div>
        );
      })}
    </>
  );

  return (
    <div
      className={cn(
        isExpanded &&
          userSponsors &&
          userSponsors.length > 0 &&
          'border-b border-slate-200 pb-3',
      )}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="flex items-center gap-2">
          {isExpandable && userSponsors && userSponsors.length > 0 && (
            <button onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          <p className="font-medium text-slate-500">{title}</p>
        </div>
        <div className="flex items-center gap-4">{renderCheckboxes()}</div>
      </div>

      {isExpanded && isExpandable && userSponsors && (
        <div className="ml-6 mt-2 space-y-3">
          {userSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-500">{sponsor.name}</p>
              </div>
              <div className="flex items-center gap-4">
                {renderCheckboxes(sponsor.id)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface NotificationSetting {
  email: boolean;
  inApp: boolean;
  listingScope: 'mine' | 'all';
}

interface NotificationStore {
  general: NotificationSetting;
  [key: string]: NotificationSetting;
}

interface NotificationState {
  [key: string]: NotificationStore;
}

const useNotificationState = (user: User) => {
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
                (setting: any) =>
                  setting.channel === 'email' && !setting.sponsorId,
              ),
              inApp: userData.some(
                (setting: any) =>
                  setting.channel === 'inApp' && !setting.sponsorId,
              ),
              listingScope: userData.find(
                (setting: any) => setting.listingScope && !setting.sponsorId,
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
          category === 'SPONSOR' &&
          user?.UserSponsors &&
          user.UserSponsors.length > 0
        ) {
          console.log(userData);
          user.UserSponsors.forEach((userSponsor: any) => {
            if (userData) {
              newState[key]![userSponsor?.sponsorId ?? 'general'] = {
                email: userData.some(
                  (setting: any) =>
                    setting.channel === 'email' &&
                    setting.sponsorId === userSponsor.sponsorId,
                ),
                inApp: userData.some(
                  (setting: any) =>
                    setting.channel === 'inApp' &&
                    setting.sponsorId === userSponsor.sponsorId,
                ),
                listingScope: userData.find(
                  (setting: any) =>
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
      if (category === 'SPONSOR' && user?.UserSponsors) {
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
          category === 'SPONSOR' &&
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
                category === 'SPONSOR' ? setting.listingScope : undefined,
            });
          }
          if (setting.inApp) {
            result.push({
              channel: 'inApp',
              type,
              sponsorId,
              listingScope:
                category === 'SPONSOR' ? setting.listingScope : undefined,
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
      category !== 'SPONSOR' ||
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
      category !== 'SPONSOR' ||
      !user?.UserSponsors ||
      user.UserSponsors.length === 0
    ) {
      const generalSetting = getNotificationSetting(category, id);
      return generalSetting.listingScope;
    }

    // Check all sponsor settings for listingScope
    const sponsorScopes = user.UserSponsors.map((userSponsor: any) => {
      const sponsorSetting = setting[userSponsor.sponsorId] || setting.general;
      return sponsorSetting.listingScope;
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

export const NotificationSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, refetchUser } = useUser();
  const posthog = usePostHog();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    getNotificationSetting,
    updateSetting,
    transformToApiFormat,
    getGeneralCheckboxState,
    getGeneralListingScope,
    isInitialized,
  } = useNotificationState(user as User);

  const updateEmailSettings = async () => {
    try {
      posthog.capture('confirm_email preferences');
      setIsUpdating(true);

      await api.post('/api/user/update-notification-settings', {
        settings: transformToApiFormat(),
      });

      await refetchUser();
      setIsUpdating(false);
      onClose();
      toast.success('Email preferences updated');
    } catch (error) {
      console.error('Error updating email preferences:', error);
      toast.error('Failed to update email preferences.');
      setIsUpdating(false);
    }
  };

  const showSponsorAlerts = user?.currentSponsorId;
  const showTalentAlerts = user?.isTalentFilled;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-2">
        <div className="h-full">
          <div className="px-6 pt-6">
            <h2 className="text-xl font-bold">Notification Settings</h2>
            <p className="font-medium text-slate-400">
              Tell us which notification you would like to receive!
            </p>
          </div>
          <ScrollArea className="h-full max-h-[900px] px-6 scrollbar-thin">
            {!isInitialized ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-slate-500">
                  Loading notification settings...
                </p>
              </div>
            ) : (
              <>
                {showSponsorAlerts && (
                  <div className="mt-8 space-y-3">
                    <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
                      <p className="text-sm font-medium tracking-[0.8px] text-slate-400">
                        SPONSOR ALERTS
                      </p>
                      <div className="flex gap-4">
                        <p className="w-20 text-center text-sm text-slate-400">
                          Listings
                        </p>
                        <p className="w-12 text-center text-sm text-slate-400">
                          Email
                        </p>
                        <p className="w-12 text-center text-sm text-slate-400">
                          In-App
                        </p>
                      </div>
                    </div>
                    {sections[NotificationRelationType.SPONSOR].map(
                      (item, index) => (
                        <AlertOption
                          key={index}
                          title={item.title}
                          channels={['email', 'inApp']}
                          getNotificationSetting={getNotificationSetting}
                          updateSetting={updateSetting}
                          alertId={index}
                          alertType="SPONSOR"
                          userSponsors={user?.UserSponsors?.map(
                            (userSponsor: any) => ({
                              id: userSponsor.sponsorId,
                              name: userSponsor.sponsor.name,
                            }),
                          )}
                          isExpandable={true}
                          getGeneralCheckboxState={getGeneralCheckboxState}
                          getGeneralListingScope={getGeneralListingScope}
                        />
                      ),
                    )}
                  </div>
                )}
                {showTalentAlerts && (
                  <div className="mt-6 space-y-3">
                    <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
                      <p className="text-sm font-medium tracking-[0.8px] text-slate-400">
                        TALENT ALERTS
                      </p>
                      <div className="flex gap-4">
                        <p className="w-12 text-center text-sm text-slate-400">
                          Email
                        </p>
                        <p className="w-12 text-center text-sm text-slate-400">
                          In-App
                        </p>
                      </div>
                    </div>
                    {sections[NotificationRelationType.TALENT].map(
                      (item, index) => (
                        <AlertOption
                          key={index}
                          title={item.title}
                          channels={['email', 'inApp']}
                          disabled={item.disabled}
                          getNotificationSetting={getNotificationSetting}
                          updateSetting={updateSetting}
                          alertId={index}
                          alertType="TALENT"
                        />
                      ),
                    )}
                  </div>
                )}
                {(showTalentAlerts || showSponsorAlerts) && (
                  <div className="mt-6 space-y-3">
                    <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
                      <p className="text-sm font-medium tracking-[0.8px] text-slate-400">
                        GENERAL ALERTS
                      </p>
                      <div className="flex gap-4">
                        <p className="w-12 text-center text-sm text-slate-400">
                          Email
                        </p>
                        <p className="w-12 text-center text-sm text-slate-400">
                          In-App
                        </p>
                      </div>
                    </div>
                    {sections['GENERAL'].map((item, index) => (
                      <AlertOption
                        key={index}
                        title={item.title}
                        alertType="GENERAL"
                        channels={['email', 'inApp']}
                        disabled={item.disabled}
                        getNotificationSetting={getNotificationSetting}
                        updateSetting={updateSetting}
                        alertId={index}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </div>

        {isInitialized && (
          <div className="px-2 sm:px-4">
            <Button
              className="ph-no-capture mb-3 w-full bg-slate-950"
              disabled={isUpdating}
              onClick={updateEmailSettings}
            >
              {isUpdating ? 'Updating Preferences..' : 'Update Preferences'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
