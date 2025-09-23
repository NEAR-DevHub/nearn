import { ExternalLink } from 'lucide-react';

import { getURLSanitized } from '@/utils/getURLSanitized';

import { type EventDataMap, EventType } from '../../types/event-data';
import { type LogProperties } from '.';

export default function TreasuryProposal(props: LogProperties) {
  const { event } = props;
  const eventType = event.eventType;
  const username = event.submission?.user?.username;

  // Get proposal link from event data
  const proposalLink = (() => {
    switch (eventType) {
      case EventType.SUBMISSION_TREASURY_CREATED:
        return (
          event.data as EventDataMap[EventType.SUBMISSION_TREASURY_CREATED]
        )?.proposalLink;
      case EventType.TREASURY_PROPOSAL_APPROVED:
        return (
          event.data as EventDataMap[EventType.TREASURY_PROPOSAL_APPROVED]
        )?.proposalLink;
      case EventType.TREASURY_PROPOSAL_REJECTED:
        return (
          event.data as EventDataMap[EventType.TREASURY_PROPOSAL_REJECTED]
        )?.proposalLink;
      case EventType.TREASURY_PROPOSAL_EXPIRED:
        return (event.data as EventDataMap[EventType.TREASURY_PROPOSAL_EXPIRED])
          ?.proposalLink;
      default:
        return null;
    }
  })();

  switch (eventType) {
    case EventType.SUBMISSION_TREASURY_CREATED:
      return (
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1 text-slate-500">
            Created payment request via NEAR Treasury
          </p>
          {proposalLink && (
            <a
              href={getURLSanitized(proposalLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
            >
              View Pending Proposal
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      );

    case EventType.TREASURY_PROPOSAL_APPROVED:
      return (
        <div className="flex flex-col gap-1">
          <p className="items-center gap-1 text-slate-500">
            Payment request for{' '}
            {username && (
              <>
                <a href={`/t/${username}`} className="text-slate-900">
                  @{username}
                </a>{' '}
              </>
            )}
            submission approved on NEAR Treasury and submission status changed
            to{' '}
            <span className="inline-block rounded-xl bg-emerald-100 px-3 py-0.5 text-emerald-800">
              Paid
            </span>
          </p>
          {proposalLink && (
            <a
              href={getURLSanitized(proposalLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800"
            >
              View Payment Proposal
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      );

    case EventType.TREASURY_PROPOSAL_EXPIRED:
    case EventType.TREASURY_PROPOSAL_REJECTED:
      return (
        <p className="gap-1 text-slate-500">
          Payment proposal for{' '}
          {username && (
            <>
              <a href={`/t/${username}`} className="font-medium text-slate-900">
                @{username}
              </a>{' '}
            </>
          )}
          via NEAR Treasury
          <br />
          <span className="text-slate-600">
            -{' '}
            {eventType === EventType.TREASURY_PROPOSAL_REJECTED
              ? 'Rejected'
              : 'Expired'}
          </span>
        </p>
      );

    default:
      return null;
  }
}
