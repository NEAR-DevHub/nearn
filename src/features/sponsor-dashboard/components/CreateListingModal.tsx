import {
  CircleDollarSign,
  ExternalLink,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { BountyIcon } from '@/svg/bounty-icon';
import { ProjectIcon } from '@/svg/project-icon';
import { SponsorshipIcon } from '@/svg/sponsorship-icon';
import { cn } from '@/utils/cn';

const listingTypes = [
  {
    name: 'Bounty',
    alterName: 'Competition',
    description: 'Short-term tasks with quick, varied contributions.',
    examples: 'Hackathons, design\n contests, creative tasks.',
    winners: 'Multiple winners. Submissions\n public after announcement.',
    payment: 'Ready to pay for multiple\n solutions.',
    gradientClassName: 'from-violet-400 to-violet-300 bg-gradient-to-r',
    titleClassName: 'text-violet-500',
    bgClassName: 'bg-violet-50',
    colorFill: '#8B5CF6',
    icon: BountyIcon,
  },
  {
    name: 'Project',
    alterName: 'Freelance',
    description: 'Structured, collaborative work with a clear goal.',
    examples: 'Website development, mobile apps,\n complex technical projects.',
    winners: 'One winner. Submissions public after\n announcement.',
    payment: 'Payment to one selected contributor\n to start work.',
    gradientClassName: 'from-blue-400 to-blue-300 bg-gradient-to-r',
    titleClassName: 'text-blue-500',
    bgClassName: 'bg-blue-50',
    colorFill: '#3B82F6',
    icon: ProjectIcon,
  },
  {
    name: 'Sponsorship',
    alterName: 'Grant',
    description: 'Ongoing support for individuals, teams, or initiatives.',
    examples:
      'Long-term partnerships, flexible\n project needs, ongoing support.',
    winners: 'Multiple winners. Submissions always\n public.',
    payment: 'Payment per selected submission\n offer.',
    gradientClassName: 'from-green-400 to-green-300 bg-gradient-to-r',
    titleClassName: 'text-green-500',
    bgClassName: 'bg-green-50',
    colorFill: '#10B981',
    icon: SponsorshipIcon,
  },
];

export const CreateListingModal = ({
  isOpen = false,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const posthog = usePostHog();

  const isMD = useMediaQuery('(min-width: 768px)');

  if (!isMD) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideCloseIcon
        className="max-w-[944px] overflow-hidden rounded-lg bg-white p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            {listingTypes.map((type) => (
              <div
                key={type.name}
                className="flex flex-col rounded-lg border border-slate-200"
              >
                <div
                  className={cn(
                    'flex flex-col gap-4 rounded-t-lg px-6 py-4',
                    type.bgClassName,
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full bg-white',
                        type.titleClassName,
                      )}
                    >
                      <type.icon
                        styles={{
                          width: '24px',
                          height: '24px',
                          fill: type.colorFill,
                        }}
                      />
                    </div>
                    <p
                      className={cn(
                        'bg-clip-text font-sans font-semibold text-transparent',
                        type.gradientClassName,
                      )}
                    >
                      {type.alterName}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'font-sans text-lg font-bold text-slate-500',
                      type.titleClassName,
                    )}
                  >
                    {type.name}
                  </p>
                </div>
                <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
                  <p className="font-sans text-sm font-medium text-slate-900">
                    {' '}
                    {type.description}
                  </p>
                  <div className="flex flex-col">
                    <div className="flex items-start gap-2 py-2 pr-2 text-slate-500">
                      <Lightbulb className="h-4 w-4 shrink-0 pt-[3px]" />
                      <p className="text-xs">{type.examples}</p>
                    </div>
                    <div className="flex items-start gap-2 py-2 pr-2 text-slate-500">
                      <Trophy className="h-4 w-4 shrink-0 pt-[3px]" />
                      <p className="text-xs">{type.winners}</p>
                    </div>
                    <div className="flex items-start gap-2 py-2 pr-2 text-slate-500">
                      <CircleDollarSign className="h-4 w-4 shrink-0 pt-[3px]" />
                      <p className="whitespace-pre-line text-xs">
                        {type.payment}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/new?type=${type.name.toLowerCase()}`}>
                    <Button
                      className="w-full bg-primary"
                      onClick={() => {
                        posthog.capture(
                          `create new ${type.name.toLowerCase()}_sponsor`,
                        );
                      }}
                    >
                      Create a {type.name}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Link
              href="https://docs.nearn.io/opportunities"
              className="flex items-center gap-3 font-sans text-sm font-medium text-slate-500"
              target="_blank"
              onClick={() => {
                posthog.capture('help me to choose_listing_sponsor');
              }}
            >
              Help Me To Choose
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
