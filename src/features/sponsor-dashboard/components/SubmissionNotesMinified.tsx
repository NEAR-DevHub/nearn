import { CommentType } from '@prisma/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Tooltip } from '@/components/ui/tooltip';
import { PROJECT_NAME } from '@/constants/project';
import type { User } from '@/interface/user';
import { cn } from '@/utils/cn';

import { Comments } from '@/features/comments/components/Comments';

import { type SubmissionWithListingUser } from '../queries/dashboard-submissions';

dayjs.extend(relativeTime);

interface SubmissionNotesMinifiedProps {
  submission: SubmissionWithListingUser;
  className?: string;
}

export const SubmissionNotesMinified = ({
  submission,
  className,
}: SubmissionNotesMinifiedProps) => {
  const [count, setCount] = useState<number>(
    submission.internalNotes.filter((note) => note.replyToId === null).length,
  );
  const [lastComment, setLastComment] = useState(submission.internalNotes[0]);
  const hasMultipleComments = count > 1;

  return (
    <div className={cn('max-w-xs', className)}>
      <HoverCard>
        <HoverCardTrigger asChild>
          {lastComment && (
            <div className="group cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="flex-1 truncate">
                  <p className="truncate whitespace-pre-wrap text-sm text-slate-600">
                    {lastComment?.message}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {lastComment?.author?.name ??
                      lastComment?.author?.username ??
                      PROJECT_NAME}{' '}
                    • {dayjs(lastComment?.createdAt).fromNow()}
                  </p>
                </div>
                {hasMultipleComments && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-xs">{count}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </HoverCardTrigger>
        <HoverCardContent
          className="w-96"
          side="left"
          align="start"
          sideOffset={5}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold">Internal Notes</span>
              <Tooltip content="Only visible to your sponsor team. Use this space to leave internal feedback, evaluation notes, or reminders.">
                <Info className="size-4 text-slate-300 hover:text-slate-400" />
              </Tooltip>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
              <Comments
                hideCount
                isAnnounced={false}
                listingSlug={submission.listing.slug ?? ''}
                listingType={submission.listing.type ?? ''}
                poc={submission.listing.poc as User}
                sponsorId={submission.listing.sponsorId}
                isVerified={submission.listing.sponsor?.isVerified}
                submissionAuthor={submission.user}
                refId={submission.id}
                refType={'SUBMISSION'}
                type={CommentType.INTERNAL_SUBMISSION_NOTES}
                count={count}
                setCount={setCount}
                take={100}
                onSuccess={(newComment) => {
                  setLastComment(newComment as any);
                }}
              />
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
