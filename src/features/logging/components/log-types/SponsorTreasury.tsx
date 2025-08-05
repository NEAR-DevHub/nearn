import React from 'react';

import { getURLSanitized } from '@/utils/getURLSanitized';

import {
  type EventDataMap,
  EventType,
} from '@/features/logging/types/event-data';

import { type LogProperties } from '.';

export default function SponsorTreasury({ event }: LogProperties) {
  const eventType = event.eventType;

  switch (eventType) {
    case EventType.SPONSOR_TREASURY_ADDED: {
      const data = event.data as EventDataMap[EventType.SPONSOR_TREASURY_ADDED];
      return (
        <p className="inline-flex items-center gap-1 text-slate-500">
          <img
            alt="NEAR Treasury"
            className="size-6"
            src="/assets/NEARTreasuryLogo.svg"
          />
          Connected to{' '}
          <a
            className="text-slate-900"
            href={getURLSanitized(data.url!)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {data.dao || 'treasury'}
          </a>
        </p>
      );
    }

    case EventType.SPONSOR_TREASURY_REMOVED: {
      const data =
        event.data as EventDataMap[EventType.SPONSOR_TREASURY_REMOVED];
      return (
        <p className="inline-flex items-center gap-1 text-slate-500">
          <img
            alt="NEAR Treasury"
            className="size-6"
            src="/assets/NEARTreasuryLogo.svg"
          />
          Disconnected from{' '}
          <a
            className="text-slate-900"
            href={getURLSanitized(data.old_url!)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {data.old_dao || 'treasury'}
          </a>
        </p>
      );
    }

    default:
      return null;
  }
}
