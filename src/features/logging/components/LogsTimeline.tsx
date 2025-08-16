'use client';

import { format, isToday } from 'date-fns';
import {
  Activity,
  Archive,
  Award,
  Check,
  CircleMinus,
  Eye,
  EyeOff,
  FileInput,
  Flag,
  Link,
  Link2,
  MessageSquare,
  NotepadText,
  Pencil,
  Plus,
  RefreshCcw,
  Trash,
  Trophy,
  UserCog,
  X,
} from 'lucide-react';
import { useMemo } from 'react';

import { ExternalImage } from '@/components/ui/cloudinary-image';

import { type Log as LogType } from '../queries/logs';
import { EventType } from '../types/event-data';
import Log from './Log';

interface Properties {
  logs?: LogType[];
  onListingClick?: (event: LogType) => void;
  onSubmissionClick?: (event: LogType) => void;
  showExtraInfo?: 'listing' | 'submission' | 'both';
  hideActorRole?: boolean;
}

const eventIcons: Record<EventType, React.ReactNode> = {
  [EventType.SPONSOR_TREASURY_ADDED]: <Link className="h-4 w-4" />,
  [EventType.SPONSOR_TREASURY_REMOVED]: <Link className="h-4 w-4" />,
  [EventType.SPONSOR_MEMBER_INVITED]: <UserCog className="h-4 w-4" />,
  [EventType.SPONSOR_MEMBER_REMOVED]: <CircleMinus className="h-4 w-4" />,
  [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: (
    <CircleMinus className="h-4 w-4" />
  ),
  [EventType.SPONSOR_MEMBER_ACCEPTED]: <UserCog className="h-4 w-4" />,
  [EventType.SPONSOR_PROFILE_EDITED]: <Pencil className="h-4 w-4" />,
  [EventType.LISTING_CREATED]: <Plus className="h-4 w-4" />,
  [EventType.LISTING_PUBLISHED]: <Eye className="h-4 w-4" />,
  [EventType.LISTING_EDITED]: <Pencil className="h-4 w-4" />,
  [EventType.LISTING_COMPLETED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.LISTING_UNPUBLISHED]: <EyeOff className="h-4 w-4" />,
  [EventType.LISTING_WINNERS_ANNOUNCED]: <Trophy className="h-4 w-4" />,
  [EventType.SUBMISSION_CREATED]: <FileInput className="h-4 w-4" />,
  [EventType.SUBMISSION_EDITED]: <Pencil className="h-4 w-4" />,
  [EventType.SUBMISSION_NOTE_CHANGED]: <NotepadText className="h-4 w-4" />,
  [EventType.SUBMISSION_LABEL_CHANGED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.SUBMISSION_TOGGLED_WINNER]: <Award className="h-4 w-4" />,
  [EventType.SUBMISSION_APPROVED]: <Check className="h-4 w-4" />,
  [EventType.SUBMISSION_REJECTED]: <X className="h-4 w-4" />,
  [EventType.SUBMISSION_TREASURY_CREATED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: <Link2 className="h-4 w-4" />,
  [EventType.SUBMISSION_PAID]: <Link2 className="h-4 w-4" />,
  [EventType.SUBMISSION_MANUAL_PAYMENT_ADDED]: <Link2 className="h-4 w-4" />,
  [EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED]: <Pencil className="h-4 w-4" />,
  [EventType.SUBMISSION_MANUAL_PAYMENT_ISSUE_REPORTED]: (
    <Flag className="h-4 w-4" />
  ),
  [EventType.COMMENT_ADDED]: <MessageSquare className="h-4 w-4" />,
  [EventType.COMMENT_DELETED]: <Trash className="h-4 w-4" />,
  [EventType.TREASURY_PROPOSAL_APPROVED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.TREASURY_PROPOSAL_REJECTED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.TREASURY_PROPOSAL_EXPIRED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.SYSTEM_STATUS_CHANGED]: <RefreshCcw className="h-4 w-4" />,
  [EventType.SYSTEM_STATUS_IN_REVIEW]: <RefreshCcw className="h-4 w-4" />,
  [EventType.PLATFORM_ADMIN_ARCHIVED_OR_UNARCHIVED]: (
    <Archive className="h-4 w-4" />
  ),
  [EventType.PLATFORM_ADMIN_SUBMISSION_STATUS_EDITED]: (
    <Pencil className="h-4 w-4" />
  ),
  [EventType.AUTOMATION_LOG]: <RefreshCcw className="h-4 w-4" />,
};

export default function LogsTimeline({
  logs,
  onListingClick,
  onSubmissionClick,
  showExtraInfo,
  hideActorRole,
}: Properties) {
  // Group logs by day
  const { groupedLogs, sortedDates } = useMemo(() => {
    if (!logs) return { groupedLogs: {}, sortedDates: [] };

    const groups = logs.reduce(
      (acc, log) => {
        const date = new Date(log.eventTime);
        const dateKey = format(date, 'yyyy-MM-dd');

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(log);
        return acc;
      },
      {} as Record<string, typeof logs>,
    );

    return { groupedLogs: groups, sortedDates: Object.keys(groups) };
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <ExternalImage
            className="mx-auto w-32"
            alt={'talent empty'}
            src={'/bg/talent-empty.svg'}
          />
          <p className="mt-5 text-lg font-medium text-slate-600">
            No activity yet
          </p>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Once an action is performed,
            <br /> it will show up here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey, dateIndex) => {
        const date = new Date(dateKey);
        const logs = groupedLogs[dateKey];
        const isLastDate = dateIndex === sortedDates.length - 1;
        const hasMultipleLogs = logs && logs.length > 1;

        return (
          <div key={dateKey} className="relative">
            <h3 className="mb-2 text-sm font-medium text-slate-500">
              {isToday(date) ? 'Today' : format(date, 'MMM d, yyyy')}
            </h3>
            <div className="relative">
              {logs &&
                logs.map((log, index) => {
                  const isLastLog = index === logs.length - 1;
                  const showLine = hasMultipleLogs && !isLastLog;
                  if (
                    log.eventType === EventType.SUBMISSION_TOGGLED_WINNER &&
                    log.listing?.type !== 'bounty'
                  ) {
                    return null;
                  } else if (
                    log.eventType === EventType.SUBMISSION_APPROVED &&
                    log.listing?.type !== 'sponsorship'
                  ) {
                    return null;
                  }

                  return (
                    <div key={log.id} className="relative flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                          {eventIcons[log.eventType as EventType] || (
                            <Activity className="h-4 w-4" />
                          )}
                        </div>
                        {showLine && (
                          <div className="absolute top-8 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <Log
                          event={log}
                          showExtraInfo={showExtraInfo}
                          hideActorRole={hideActorRole}
                          onListingClick={onListingClick}
                          onSubmissionClick={onSubmissionClick}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
            {!isLastDate && <div className="mb-4" />}
          </div>
        );
      })}
    </div>
  );
}
