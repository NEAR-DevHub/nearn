import { NotificationRelationType } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';

import { sections } from '../constants';
import { useNotificationState } from '../hooks/useNotificationState';
import { AlertCategory } from '../types';
import { AlertOption } from './AlertOption';
import { AlertSectionHeader } from './AlertSectionHeader';

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
  } = useNotificationState(user!);

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
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences.');
      setIsUpdating(false);
    }
  };

  const showSponsorAlerts = user?.currentSponsorId;
  const showTalentAlerts = user?.isTalentFilled;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Tell us which notification you would like to receive!
          </DialogDescription>
        </DialogHeader>
        <div className="h-full">
          <ScrollArea className="h-full max-h-[900px] scrollbar-thin">
            {!isInitialized ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  <p className="text-slate-500">
                    Loading notification settings...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {showSponsorAlerts && (
                  <div className="space-y-3">
                    <AlertSectionHeader
                      title="sponsor alerts"
                      showListings={true}
                    />
                    {sections[NotificationRelationType.SPONSOR].map(
                      (item, index) => (
                        <AlertOption
                          key={index}
                          title={item.title}
                          channels={['email', 'inApp']}
                          getNotificationSetting={getNotificationSetting}
                          updateSetting={updateSetting}
                          alertId={index}
                          alertType={AlertCategory.SPONSOR}
                          userSponsors={user?.UserSponsors}
                          isExpandable={true}
                          getGeneralCheckboxState={getGeneralCheckboxState}
                          getGeneralListingScope={getGeneralListingScope}
                        />
                      ),
                    )}
                  </div>
                )}
                {showTalentAlerts && (
                  <div className="space-y-3">
                    <AlertSectionHeader title="talent alerts" />
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
                          alertType={AlertCategory.TALENT}
                        />
                      ),
                    )}
                  </div>
                )}
                {(showTalentAlerts || showSponsorAlerts) && (
                  <div className="space-y-3">
                    <AlertSectionHeader title="general alerts" />
                    {sections['GENERAL'].map((item, index) => (
                      <AlertOption
                        key={index}
                        title={item.title}
                        alertType={AlertCategory.GENERAL}
                        channels={['email', 'inApp']}
                        disabled={item.disabled}
                        getNotificationSetting={getNotificationSetting}
                        updateSetting={updateSetting}
                        alertId={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {isInitialized && (
          <div className="z-[50]">
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
