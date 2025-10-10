import { NotificationRelationType } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';

import {
  BASIC_ALERT_COLUMN_WIDTHS,
  CHANNEL_LABELS,
  sections,
  SPONSOR_ALERT_COLUMN_WIDTHS,
} from '../constants';
import { useNotificationState } from '../hooks/useNotificationState';
import { AlertCategory } from '../types';
import { transformToApiFormat } from '../utils/transformToApiFormat';
import { AlertSettingsItem } from './AlertSettingsItem';
import { AlertSettingsSectionLayout } from './AlertSettingsSectionLayout';
import { SponsorAlertSettingsItem } from './SponsorAlertSettingsItem';

interface AlertSettingsProps {
  onSave?: () => void;
}

export const AlertSettings = ({ onSave }: AlertSettingsProps) => {
  const { user, refetchUser } = useUser();
  const posthog = usePostHog();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    notificationState,
    getNotificationSetting,
    updateSetting,
    getGeneralCheckboxState,
    getGeneralListingScope,
    isInitialized,
  } = useNotificationState(user);

  const updateEmailSettings = async () => {
    if (!user) return;
    try {
      posthog.capture('confirm_email preferences');
      setIsUpdating(true);

      await api.post('/api/user/update-notification-settings', {
        settings: transformToApiFormat(notificationState, user),
      });

      await refetchUser();
      setIsUpdating(false);
      onSave?.();
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences.');
      setIsUpdating(false);
    }
  };

  if (!isInitialized || !user) {
    return <LoadingState />;
  }

  const userSponsors = user.UserSponsors;
  const showSponsorAlerts = userSponsors && userSponsors.length > 0;
  const showTalentAlerts = user.isTalentFilled;
  const showGeneralAlerts = showSponsorAlerts || showTalentAlerts;

  return (
    <div className="flex flex-col gap-6">
      {showSponsorAlerts && (
        <div className="hidden sm:block">
          <AlertSettingsSectionLayout
            title="sponsor alerts"
            columnNames={[
              'Listings',
              CHANNEL_LABELS.email,
              CHANNEL_LABELS.inApp,
            ]}
            columnWidths={SPONSOR_ALERT_COLUMN_WIDTHS}
          >
            {sections[NotificationRelationType.SPONSOR].map((item, index) => (
              <SponsorAlertSettingsItem
                key={index}
                title={item.title}
                alertId={index}
                alertType={AlertCategory.SPONSOR}
                userSponsors={userSponsors}
                getGeneralCheckboxState={getGeneralCheckboxState}
                getGeneralListingScope={getGeneralListingScope}
                getNotificationSetting={getNotificationSetting}
                updateSetting={updateSetting}
              />
            ))}
          </AlertSettingsSectionLayout>
        </div>
      )}
      {showTalentAlerts && (
        <AlertSettingsSectionLayout
          title="talent alerts"
          columnNames={[CHANNEL_LABELS.email, CHANNEL_LABELS.inApp]}
          columnWidths={BASIC_ALERT_COLUMN_WIDTHS}
        >
          {sections[NotificationRelationType.TALENT].map((item, index) => (
            <AlertSettingsItem
              key={index}
              alertId={index}
              title={item.title}
              disabled={item.disabled}
              alertType={AlertCategory.TALENT}
              updateSetting={updateSetting}
              getGeneralCheckboxState={getGeneralCheckboxState}
            />
          ))}
        </AlertSettingsSectionLayout>
      )}
      {showGeneralAlerts && (
        <AlertSettingsSectionLayout
          title="general alerts"
          columnNames={[CHANNEL_LABELS.email, CHANNEL_LABELS.inApp]}
          columnWidths={BASIC_ALERT_COLUMN_WIDTHS}
        >
          {sections['GENERAL'].map((item, index) => (
            <AlertSettingsItem
              key={index}
              alertId={index}
              title={item.title}
              disabled={item.disabled}
              alertType={AlertCategory.GENERAL}
              updateSetting={updateSetting}
              getGeneralCheckboxState={getGeneralCheckboxState}
            />
          ))}
        </AlertSettingsSectionLayout>
      )}
      <div className="z-[50]">
        <Button
          className="ph-no-capture mb-3 w-full bg-slate-950"
          disabled={isUpdating}
          onClick={updateEmailSettings}
        >
          {isUpdating ? 'Updating Preferences..' : 'Update Preferences'}
        </Button>
      </div>
    </div>
  );
};

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <p className="text-slate-500">Loading notification settings...</p>
      </div>
    </div>
  );
}
