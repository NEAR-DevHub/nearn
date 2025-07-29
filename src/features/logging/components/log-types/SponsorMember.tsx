import React from 'react';

import {
  type EventDataMap,
  EventType,
} from '@/features/logging/types/event-data';

import { type LogProperties } from '.';

export default function SponsorMember({ event }: LogProperties) {
  const eventType = event.eventType;

  switch (eventType) {
    case EventType.SPONSOR_MEMBER_INVITED: {
      const data = event.data as EventDataMap[EventType.SPONSOR_MEMBER_INVITED];
      return (
        <p className="inline-flex items-center gap-1 text-slate-500">
          Invited <span className="font-medium">{data.invitedEmail}</span> to
          the team
        </p>
      );
    }

    case EventType.SPONSOR_MEMBER_ACCEPTED: {
      return (
        <p className="inline-flex items-center gap-1 text-slate-500">
          Joined the team
        </p>
      );
    }

    case EventType.SPONSOR_MEMBER_INVITE_REMOVED: {
      const data =
        event.data as EventDataMap[EventType.SPONSOR_MEMBER_INVITE_REMOVED];
      return (
        <p className="inline-flex items-center gap-1 text-slate-500">
          Removed invite for{' '}
          <span className="font-medium">{data.invitedEmail}</span>
        </p>
      );
    }

    case EventType.SPONSOR_MEMBER_REMOVED: {
      const data = event.data as EventDataMap[EventType.SPONSOR_MEMBER_REMOVED];
      // Note: User data is not available in the event, only the user ID
      return (
        <p className="inline-flex items-center gap-1 text-slate-500">
          Removed <span className="font-medium">{data.removedUserId}</span> from
          the team
        </p>
      );
    }

    default:
      return null;
  }
}
