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

import { type useNotificationState } from '../hooks/useNotificationState';
import { type AlertCategory } from '../types';

interface SponsorAlertSettingsItemProps {
  title: string;
  alertId: number;
  alertType: AlertCategory;
  channels: string[];
  disabled?: string[];
  userSponsors?: UserSponsor[];
  updateSetting: ReturnType<typeof useNotificationState>['updateSetting'];
  getGeneralCheckboxState: ReturnType<
    typeof useNotificationState
  >['getGeneralCheckboxState'];
  getGeneralListingScope: ReturnType<
    typeof useNotificationState
  >['getGeneralListingScope'];
  getNotificationSetting: ReturnType<
    typeof useNotificationState
  >['getNotificationSetting'];
}

export function SponsorAlertSettingsItem({
  title,
  alertId,
  alertType,
  channels,
  disabled = [],
  userSponsors,
  updateSetting,
  getGeneralCheckboxState,
  getGeneralListingScope,
  getNotificationSetting,
}: SponsorAlertSettingsItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCheckboxChange = (
    channel: string,
    checked: boolean,
    currentSponsorId?: string,
  ) => {
    const updateSettingData =
      channel === 'email' ? { email: checked } : { inApp: checked };
    updateSetting(alertType, alertId, updateSettingData, currentSponsorId);
  };

  const handleListingScopeChange = (
    value: string,
    currentSponsorId?: string,
  ) => {
    if (value === 'mixed') return;
    updateSetting(
      alertType,
      alertId,
      { listingScope: value as 'mine' | 'all' },
      currentSponsorId,
    );
  };

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
          {userSponsors && userSponsors.length > 0 && (
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
        <div className="flex items-center gap-4">
          <ListingScopeSelect
            alertType={alertType}
            alertId={alertId}
            getGeneralListingScope={getGeneralListingScope}
            getNotificationSetting={getNotificationSetting}
            onValueChange={handleListingScopeChange}
          />
          {channels.map((channel) => (
            <ChannelCheckbox
              key={channel}
              channel={channel}
              alertType={alertType}
              alertId={alertId}
              disabled={disabled}
              getGeneralCheckboxState={getGeneralCheckboxState}
              getNotificationSetting={getNotificationSetting}
              onCheckedChange={handleCheckboxChange}
            />
          ))}
        </div>
      </div>

      {isExpanded && userSponsors && (
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
                <ListingScopeSelect
                  alertType={alertType}
                  alertId={alertId}
                  currentSponsorId={userSponsor.sponsorId}
                  getGeneralListingScope={getGeneralListingScope}
                  getNotificationSetting={getNotificationSetting}
                  onValueChange={handleListingScopeChange}
                />
                {channels.map((channel) => (
                  <ChannelCheckbox
                    key={channel}
                    channel={channel}
                    alertType={alertType}
                    alertId={alertId}
                    currentSponsorId={userSponsor.sponsorId}
                    disabled={disabled}
                    getGeneralCheckboxState={getGeneralCheckboxState}
                    getNotificationSetting={getNotificationSetting}
                    onCheckedChange={handleCheckboxChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ListingScopeSelectProps {
  alertType: AlertCategory;
  alertId: number;
  currentSponsorId?: string;
  getGeneralListingScope: ReturnType<
    typeof useNotificationState
  >['getGeneralListingScope'];
  getNotificationSetting: ReturnType<
    typeof useNotificationState
  >['getNotificationSetting'];
  onValueChange: (value: string, currentSponsorId?: string) => void;
}

function ListingScopeSelect({
  alertType,
  alertId,
  currentSponsorId,
  getGeneralListingScope,
  getNotificationSetting,
  onValueChange,
}: ListingScopeSelectProps) {
  const value = currentSponsorId
    ? getNotificationSetting(alertType, alertId, currentSponsorId).listingScope
    : getGeneralListingScope(alertType, alertId);

  return (
    <div className="w-16">
      <Select
        value={value ?? 'mine'}
        onValueChange={(value) => onValueChange(value, currentSponsorId)}
      >
        <SelectTrigger className="h-8 w-fit gap-1 border-none p-0 text-sm text-slate-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mine">Mine</SelectItem>
          <SelectItem value="all">All</SelectItem>
          {!currentSponsorId && (
            <SelectItem value="mixed" className="hidden" disabled>
              Mixed
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ChannelCheckboxProps {
  channel: string;
  alertType: AlertCategory;
  alertId: number;
  currentSponsorId?: string;
  disabled: string[];
  getGeneralCheckboxState: ReturnType<
    typeof useNotificationState
  >['getGeneralCheckboxState'];
  getNotificationSetting: ReturnType<
    typeof useNotificationState
  >['getNotificationSetting'];
  onCheckedChange: (
    channel: string,
    checked: boolean,
    currentSponsorId?: string,
  ) => void;
}

function ChannelCheckbox({
  channel,
  alertType,
  alertId,
  currentSponsorId,
  disabled,
  getGeneralCheckboxState,
  getNotificationSetting,
  onCheckedChange,
}: ChannelCheckboxProps) {
  const setting = getNotificationSetting(alertType, alertId, currentSponsorId);
  const checkboxState = currentSponsorId
    ? {
        checked: channel === 'email' ? setting.email : setting.inApp,
        indeterminate: false,
      }
    : getGeneralCheckboxState(alertType, alertId, channel);
  const isDisabled = disabled.includes(channel);

  return (
    <div className="flex w-12 justify-center">
      <Checkbox
        className="data-[state=unchecked]:border-slate-200 disabled:bg-slate-100"
        checked={
          checkboxState.indeterminate ? 'indeterminate' : checkboxState.checked
        }
        disabled={isDisabled}
        onCheckedChange={(checked) =>
          onCheckedChange(channel, !!checked, currentSponsorId)
        }
      />
    </div>
  );
}
