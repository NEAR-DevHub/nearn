import { usePostHog } from 'posthog-js/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';
import { NotificationRelationType } from '@prisma/client';
import { EventType } from '@/features/logging/types/event-data';
import { NotificationType } from '@/features/notifications/types';

interface AlertOptionProps {
  title: string;
  channels: string[];
  type: string;
  selectedCategories: [string, string][];
  onCategoryChange: (channel: string, type: string) => void;
}

const sections = {
  [NotificationRelationType.SPONSOR]: [
    {
      title: 'New submissions received for your listing',
      type: EventType.SUBMISSION_CREATED,
    },
    {
      title: 'Submission edited',
      type: EventType.SUBMISSION_EDITED,
    },
    {
      title: 'Comments Received on your listing',
      type: NotificationType.LISTING_COMMENT,
    },
    {
      title: 'Deadline related reminders',
      type: NotificationType.DEADLINE_IN_3_DAYS,
    },
  ]
}

const AlertOption = ({
  title,
  channels,
  type,
  selectedCategories,
  onCategoryChange,
}: AlertOptionProps) => (
  <div className="grid grid-cols-[1fr_auto] items-center gap-4">
    <p className="font-medium text-slate-500">{title}</p>
    <div className="flex gap-4">
      {channels.map((channel) => (
        <div key={channel} className="flex w-12 justify-center">
          <Checkbox
            className="data-[state=unchecked]:border-slate-200"
            checked={selectedCategories.some(
              ([c, t]) => c === channel && t === type,
            )}
            onCheckedChange={() => onCategoryChange(channel, type)}
          />
        </div>
      ))}
    </div>
  </div>
);

export const NotificationSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, refetchUser } = useUser();
  const posthog = usePostHog();

  const emailSettings = user?.NotificationSettings || [];
  const [selectedCategories, setSelectedCategories] = useState<
    [string, string][]
  >(emailSettings.map((setting) => [setting.channel, setting.type]));
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCategoryChange = (channel: string, type: string) => {
    setSelectedCategories((prev) =>
      prev.some(
        ([oldChannel, oldType]) => oldChannel === channel && oldType === type,
      )
        ? prev.filter(
          ([oldChannel, oldType]) =>
            oldChannel !== channel || oldType !== type,
        )
        : [...prev, [channel, type]],
    );
  };

  const updateEmailSettings = async () => {
    try {
      posthog.capture('confirm_email preferences');
      setIsUpdating(true);
      await api.post('/api/user/update-notification-settings', {
        settings: selectedCategories,
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
      <DialogContent className="p-2">
        <div className="p-6">
          <h2 className="text-xl font-bold">Notification Settings</h2>
          <p className="font-medium text-slate-400">
            Tell us which notification you would like to receive!
          </p>
          {showSponsorAlerts && (
            <div className="mt-6">
              <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
                <p className="text-sm tracking-[0.8px] text-slate-400">
                  SPONSOR ALERTS
                </p>
                <div className="flex gap-4">
                  <p className="w-12 text-center text-sm text-slate-400">
                    Email
                  </p>
                  <p className="w-12 text-center text-sm text-slate-400">
                    On Site
                  </p>
                </div>
              </div>
              <AlertOption
                title="New submissions received for your listing"
                channels={['email', 'onSite']}
                type="submissionSponsor"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              <AlertOption
                title="Comments Received on your listing"
                channels={['email', 'onSite']}
                type="commentSponsor"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              <AlertOption
                title="Deadline related reminders"
                channels={['email', 'onSite']}
                type="deadlineSponsor"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}
          {showTalentAlerts && (
            <div className="mt-6">
              <p className="mb-3 text-sm tracking-[0.8px] text-slate-400">
                TALENT ALERTS
              </p>
              <AlertOption
                title="Weekly Roundup of new listings"
                channels={['email', 'onSite']}
                type="weeklyListingRoundup"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              <AlertOption
                title="New listings added for my skills"
                channels={['email', 'onSite']}
                type="createListing"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              <AlertOption
                title="Likes and comments on my submissions"
                channels={['email', 'onSite']}
                type="commentOrLikeSubmission"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              <AlertOption
                title="Sponsor Invitation Emails (Scout)"
                channels={['email', 'onSite']}
                type="scoutInvite"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}
          {(showTalentAlerts || showSponsorAlerts) && (
            <div className="mt-6">
              <p className="mb-3 text-sm tracking-[0.8px] text-slate-400">
                GENERAL ALERTS
              </p>
              <AlertOption
                title="Comment replies and tags"
                channels={['email', 'onSite']}
                type="replyOrTagComment"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
              <AlertOption
                title="Product updates and newsletters"
                channels={['email', 'onSite']}
                type="productAndNewsletter"
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}
        </div>

        <div className="px-2 sm:px-4">
          <Button
            className="ph-no-capture mb-3 w-full bg-slate-950"
            disabled={isUpdating}
            onClick={updateEmailSettings}
          >
            {isUpdating ? 'Updating Preferences..' : 'Update Preferences'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
