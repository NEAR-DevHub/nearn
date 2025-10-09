import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type UserSponsor } from '@/interface/userSponsor';
import { cn } from '@/utils/cn';

import { SPONSOR_ALERT_COLUMN_WIDTHS } from '../constants';
import { type useNotificationState } from '../hooks/useNotificationState';
import { type AlertCategory, AlertChannel, type ListingScope } from '../types';
import { AlertSettingCheckbox } from './AlertSettingCheckbox';
import { AlertSettingsRow } from './AlertSettingsRow';
import { AlertSettingsTitle } from './AlertSettingsTitle';

type UseNotificationStateReturn = ReturnType<typeof useNotificationState>;

interface SponsorAlertSettingsItemProps {
  title: string;
  alertId: number;
  alertType: AlertCategory;
  disabled?: string[];
  userSponsors: UserSponsor[];
  updateSetting: UseNotificationStateReturn['updateSetting'];
  getGeneralCheckboxState: UseNotificationStateReturn['getGeneralCheckboxState'];
  getGeneralListingScope: UseNotificationStateReturn['getGeneralListingScope'];
  getNotificationSetting: UseNotificationStateReturn['getNotificationSetting'];
}

export function SponsorAlertSettingsItem({
  title,
  alertId,
  alertType,
  disabled = [],
  userSponsors,
  updateSetting,
  getGeneralCheckboxState,
  getGeneralListingScope,
  getNotificationSetting,
}: SponsorAlertSettingsItemProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const channels = [AlertChannel.EMAIL, AlertChannel.IN_APP];

  const handleCheckboxChange = (
    channel: AlertChannel,
    checked: boolean,
    currentSponsorId?: string,
  ) => {
    const updateSettingData =
      channel === AlertChannel.EMAIL ? { email: checked } : { inApp: checked };
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
      { listingScope: value as ListingScope },
      currentSponsorId,
    );
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn(isExpanded && 'border-b border-slate-200 pb-3')}
    >
      <AlertSettingsRow
        titleElement={
          <CollapsibleRowTrigger title={title} isExpanded={isExpanded} />
        }
        columnWidths={SPONSOR_ALERT_COLUMN_WIDTHS}
      >
        <ListingScopeSelect
          alertType={alertType}
          alertId={alertId}
          getGeneralListingScope={getGeneralListingScope}
          getNotificationSetting={getNotificationSetting}
          onValueChange={handleListingScopeChange}
        />
        {channels.map((channel) => (
          <AlertSettingCheckbox
            key={channel}
            channel={channel}
            alertType={alertType}
            alertId={alertId}
            disabled={disabled}
            updateSetting={updateSetting}
            getGeneralCheckboxState={getGeneralCheckboxState}
          />
        ))}
      </AlertSettingsRow>
      <CollapsibleContent>
        <div className="ml-6 mt-2 space-y-3">
          {userSponsors.map((userSponsor) => (
            <AlertSettingsRow
              key={userSponsor.sponsorId}
              titleElement={
                <AlertSettingsTitle value={userSponsor.sponsor?.name || ''} />
              }
              columnWidths={SPONSOR_ALERT_COLUMN_WIDTHS}
            >
              <ListingScopeSelect
                alertType={alertType}
                alertId={alertId}
                currentSponsorId={userSponsor.sponsorId}
                getGeneralListingScope={getGeneralListingScope}
                getNotificationSetting={getNotificationSetting}
                onValueChange={handleListingScopeChange}
              />
              {channels.map((channel) => {
                const setting = getNotificationSetting(
                  alertType,
                  alertId,
                  userSponsor.sponsorId,
                );
                const isDisabled = disabled.includes(channel);
                const checked =
                  channel === AlertChannel.EMAIL
                    ? setting.email
                    : setting.inApp;

                return (
                  <Checkbox
                    key={channel}
                    className="data-[state=unchecked]:border-slate-200 disabled:bg-slate-100"
                    checked={checked}
                    disabled={isDisabled}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        channel,
                        !!checked,
                        userSponsor.sponsorId,
                      )
                    }
                  />
                );
              })}
            </AlertSettingsRow>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ListingScopeSelectProps {
  alertType: AlertCategory;
  alertId: number;
  currentSponsorId?: string;
  getGeneralListingScope: UseNotificationStateReturn['getGeneralListingScope'];
  getNotificationSetting: UseNotificationStateReturn['getNotificationSetting'];
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
  );
}

interface CollapsibleRowTriggerProps {
  title: string;
  isExpanded: boolean;
}

function CollapsibleRowTrigger({
  title,
  isExpanded,
}: CollapsibleRowTriggerProps) {
  return (
    <CollapsibleTrigger asChild>
      <button type="button" className="flex w-full items-center text-left">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-3 w-3 text-slate-500" />
          )}
          <AlertSettingsTitle value={title} />
        </div>
      </button>
    </CollapsibleTrigger>
  );
}
