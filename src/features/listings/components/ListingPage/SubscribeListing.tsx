import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { useMemo } from 'react';
import { TbBell, TbBellRinging } from 'react-icons/tb';
import { toast } from 'sonner';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { AuthWrapper } from '@/features/auth/components/AuthWrapper';

import { listingSubscriptionsQuery } from '../../queries/listing-notification-status';

interface Props {
  id: string;
  isTemplate?: boolean;
}

const toggleSubscription = async (id: string) => {
  await api.post('/api/listings/notifications/toggle', { bountyId: id });
};

export const SubscribeListing = ({ id, isTemplate = false }: Props) => {
  const { user } = useUser();
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const { data: sub = [] } = useQuery(listingSubscriptionsQuery(id));

  const { mutate: toggleSubscribe, isPending: isSubscribeLoading } =
    useMutation({
      mutationFn: () => toggleSubscription(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: listingSubscriptionsQuery(id).queryKey,
        });
        toast.success(
          sub.find((e) => e.userId === user?.id)
            ? 'Unsubscribed'
            : 'Subscribed',
        );
      },
      onError: () => {
        toast.error('Error occurred while toggling subscription');
      },
    });

  const handleToggleSubscribe = () => {
    toggleSubscribe();
  };

  const isSubscribed = sub.find((e) => e.userId === user?.id);

  const displaySubs = useMemo(() => {
    if (isSubscribed && user) {
      const otherSubs = sub.filter((e) => e.userId !== user.id);
      return [...otherSubs.slice(0, 2), isSubscribed];
    }
    return sub.slice(0, 3);
  }, [isSubscribed, user, sub]);

  return (
    <div className="flex items-center gap-2">
      {sub.length > 0 && <p className="text-slate-500">{sub.length}</p>}
      <div className="flex -space-x-3">
        {displaySubs.map((avatar, index) => (
          <Avatar
            key={index}
            className="h-6 w-6 border-2 border-white md:h-8 md:w-8"
          >
            <AvatarImage
              src={avatar.User?.photo || ''}
              alt={avatar.User?.username || ''}
            />
          </Avatar>
        ))}
      </div>
      <div className="flex items-start">
        <AuthWrapper
          showCompleteProfileModal
          completeProfileModalBodyText={
            'Please complete your profile before subscribing to a listing.'
          }
        >
          <TooltipPrimitive.Provider delayDuration={0}>
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  className={cn(
                    'ph-no-capture gap-2 border-slate-300 font-medium text-slate-500',
                    'w-auto p-0 px-3',
                  )}
                  variant="outline"
                  disabled={isTemplate}
                  onClick={() => {
                    posthog.capture(
                      isSubscribed
                        ? 'unnotify me_listing'
                        : 'notify me_listing',
                    );
                    handleToggleSubscribe();
                  }}
                  aria-label="Notify"
                >
                  {isSubscribeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    <TbBellRinging />
                  ) : (
                    <TbBell />
                  )}
                  <span className="hidden">
                    {isSubscribeLoading
                      ? 'Subscribing'
                      : isSubscribed
                        ? 'Subscribed'
                        : 'Subscribe'}
                  </span>
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  sideOffset={4}
                  className="z-50 max-w-sm overflow-hidden rounded-md border bg-gray-50 px-3 py-1.5 text-xs text-slate-700 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                  {isSubscribed
                    ? 'Unsubscribe.'
                    : 'Subscribe. By subscribing, this listing will appear on your home dashboard for quick access.'}
                  <TooltipPrimitive.Arrow className="fill-gray-50" />
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          </TooltipPrimitive.Provider>
        </AuthWrapper>
      </div>
    </div>
  );
};
