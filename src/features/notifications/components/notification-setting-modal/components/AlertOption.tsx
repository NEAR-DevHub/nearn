import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type UserSponsor } from '@/interface/userSponsor';
import { cn } from '@/utils/cn';

import { AlertCategory, type NotificationSetting } from '../types';

interface AlertOptionProps {
  title: string;
  channels: string[];
  disabled?: string[];
  alertType: AlertCategory;
  alertId: number;
  userSponsors?: UserSponsor[];
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

export const AlertOption = ({
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
      {alertType === AlertCategory.SPONSOR && (
        <div className="w-16">
          <Select
            value={
              (() => {
                if (
                  !currentSponsorId &&
                  getGeneralListingScope &&
                  isExpandable
                ) {
                  return getGeneralListingScope(alertType, alertId);
                }
                return getNotificationSetting(
                  alertType,
                  alertId,
                  currentSponsorId,
                ).listingScope;
              })() ?? 'mine'
            }
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
          {userSponsors.map((userSponsor) => (
            <div
              key={userSponsor.sponsorId}
              className="grid grid-cols-[1fr_auto] items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-500">
                  {userSponsor.sponsor?.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {renderCheckboxes(userSponsor.sponsorId)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
