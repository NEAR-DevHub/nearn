import {
  type ActorType,
  type EventCategory,
  type EventLog,
  type EventVisibility,
  type Prisma,
  type PrismaClient,
} from '@prisma/client';

import { prisma } from '@/prisma';

import { type EventDataMap, EventType } from '../types/event-data';

export interface Log<T extends EventType> {
  eventType: T;
  actor: { id?: string; type: ActorType };
  entities?: {
    listingId?: string;
    submissionId?: string;
    sponsorId?: string;
  };
  data: EventDataMap[T];
  visibility?: EventVisibility;
  eventTime?: Date;
}

export interface EventLogger {
  log<T extends EventType>(params: Log<T>): Promise<EventLog>;
  bulkLog(events: Array<Log<EventType>>): Promise<EventLog[]>;
}

/**
 * Determine the event category based on event type
 */
function getEventCategory(eventType: EventType): EventCategory {
  if (eventType.startsWith('SPONSOR_')) return 'SPONSOR';
  if (eventType.startsWith('LISTING_')) return 'LISTING';
  if (eventType.startsWith('SUBMISSION_')) return 'SUBMISSION';
  if (eventType.startsWith('COMMENT_')) return 'COMMENT';
  if (eventType.startsWith('TREASURY_')) return 'TREASURY';
  if (eventType.startsWith('SYSTEM_')) return 'SYSTEM';

  // Default fallback
  return 'SYSTEM';
}

/**
 * Determine default visibility based on event type
 */
function getDefaultVisibility(eventType: EventType): EventVisibility {
  const mapping: Record<EventType, EventVisibility> = {
    [EventType.LISTING_PUBLISHED]: 'PUBLIC',
    [EventType.SUBMISSION_CREATED]: 'PUBLIC',
    [EventType.COMMENT_ADDED]: 'PUBLIC',
    [EventType.COMMENT_DELETED]: 'PUBLIC',
    [EventType.LISTING_EDITED]: 'PUBLIC',
    [EventType.LISTING_COMPLETED]: 'PUBLIC',
    [EventType.LISTING_UNPUBLISHED]: 'PUBLIC',
    [EventType.LISTING_WINNERS_ANNOUNCED]: 'PUBLIC',
    [EventType.SUBMISSION_LABEL_CHANGED]: 'PUBLIC',
    [EventType.SUBMISSION_REJECTED]: 'PUBLIC',
    [EventType.SUBMISSION_APPROVED]: 'PUBLIC',
    [EventType.SUBMISSION_TREASURY_CREATED]: 'PUBLIC',
    [EventType.SUBMISSION_PAID]: 'PUBLIC',
    [EventType.TREASURY_PROPOSAL_APPROVED]: 'PUBLIC',
    [EventType.TREASURY_PROPOSAL_REJECTED]: 'PUBLIC',
    [EventType.TREASURY_PROPOSAL_EXPIRED]: 'PUBLIC',
    [EventType.SYSTEM_STATUS_CHANGED]: 'PUBLIC',
    [EventType.SUBMISSION_EDITED]: 'TALENT',
    [EventType.SUBMISSION_TOGGLED_WINNER]: 'SPONSOR',
    [EventType.LISTING_CREATED]: 'SPONSOR',
    [EventType.SPONSOR_TREASURY_ADDED]: 'SPONSOR',
    [EventType.SPONSOR_TREASURY_REMOVED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_INVITED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_REMOVED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_ACCEPTED]: 'SPONSOR',
    [EventType.SPONSOR_PROFILE_EDITED]: 'SPONSOR',
    [EventType.SUBMISSION_NOTE_CHANGED]: 'SPONSOR',
    [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: 'SPONSOR',
  };

  return mapping[eventType];
}

class EventLoggerService implements EventLogger {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async log<T extends EventType>(params: Log<T>): Promise<EventLog> {
    return (await this.bulkLog([params]))[0]!;
  }

  async bulkLog(events: Array<Log<EventType>>): Promise<EventLog[]> {
    const eventData = events.map((event) => ({
      eventType: event.eventType,
      eventCategory: getEventCategory(event.eventType),
      actorId: event.actor.id,
      actorType: event.actor.type,
      listingId: event.entities?.listingId || null,
      submissionId: event.entities?.submissionId || null,
      sponsorId: event.entities?.sponsorId || null,
      data: event.data as Prisma.JsonObject,
      visibility: event.visibility || getDefaultVisibility(event.eventType),
      eventTime: event.eventTime || new Date(),
    }));

    try {
      const createdEvents = await this.prisma.eventLog.createMany({
        data: eventData,
        skipDuplicates: true,
      });

      // Fetch and return the created events
      const lastEvents = await this.prisma.eventLog.findMany({
        take: createdEvents.count,
        orderBy: { createdAt: 'desc' },
      });

      return lastEvents;
    } catch (error) {
      console.error('Failed to bulk log events:', error);
      throw new Error(
        `Failed to bulk log events: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

export const eventLogger = new EventLoggerService();

export { EventLoggerService };
