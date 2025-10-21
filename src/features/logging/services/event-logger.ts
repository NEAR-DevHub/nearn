import {
  type ActorType,
  type EventVisibility,
  type Prisma,
  type PrismaClient,
} from '@prisma/client';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';

import { createNotificationFromEvent } from '@/features/notifications/services/notification-service';

import { type Log as LogType, prismaLogInclude } from '../queries';
import { type EventDataMap, EventType } from '../types/event-data';

export interface Log<T extends EventType> {
  eventType: T;
  actor: { id?: string; type: ActorType };
  subType?: string;
  entities?: {
    listingId?: string;
    submissionId?: string;
    powId?: string;
    sponsorId?: string;
    commentId?: string;
    milestoneId?: string;
  };
  data: EventDataMap[T];
  visibility?: EventVisibility;
  eventTime?: Date;
}

export interface EventLogger {
  log<T extends EventType>(params: Log<T>): Promise<LogType | undefined>;
  bulkLog(events: Array<Log<EventType>>): Promise<LogType[]>;
}

/**
 * Determine default visibility based on event type
 */
function getDefaultVisibility(eventType: EventType): EventVisibility {
  const mapping: Record<EventType, EventVisibility> = {
    [EventType.LISTING_PUBLISHED]: 'PUBLIC',
    [EventType.SUBMISSION_CREATED]: 'PUBLIC',
    [EventType.COMMENT_ADDED]: 'PUBLIC',
    [EventType.LISTING_EDITED]: 'PUBLIC',
    [EventType.LISTING_COMPLETED]: 'PUBLIC',
    [EventType.LISTING_UNPUBLISHED]: 'PUBLIC',
    [EventType.LISTING_WINNERS_ANNOUNCED]: 'PUBLIC',
    [EventType.SUBMISSION_REJECTED]: 'PUBLIC',
    [EventType.SUBMISSION_APPROVED]: 'PUBLIC',
    [EventType.SUBMISSION_TREASURY_CREATED]: 'PUBLIC',
    [EventType.SUBMISSION_PAID]: 'PUBLIC',
    [EventType.SUBMISSION_MANUAL_PAYMENT_ADDED]: 'PUBLIC',
    [EventType.TREASURY_PROPOSAL_APPROVED]: 'PUBLIC',
    [EventType.TREASURY_PROPOSAL_REJECTED]: 'PUBLIC',
    [EventType.TREASURY_PROPOSAL_EXPIRED]: 'PUBLIC',
    [EventType.SYSTEM_STATUS_CHANGED]: 'PUBLIC',
    [EventType.SUBMISSION_CANCELLED]: 'TALENT',
    [EventType.SUBMISSION_LABEL_CHANGED]: 'TALENT',
    [EventType.SUBMISSION_EDITED]: 'TALENT',
    [EventType.MILESTONE_CREATED]: 'TALENT',
    [EventType.MILESTONE_STATUS_UPDATED]: 'TALENT',
    [EventType.MILESTONE_APPROVED]: 'TALENT',
    [EventType.MILESTONES_EDITED]: 'TALENT',
    [EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED]: 'SPONSOR',
    [EventType.COMMENT_DELETED]: 'SPONSOR',
    [EventType.SUBMISSION_TOGGLED_WINNER]: 'SPONSOR',
    [EventType.LISTING_CREATED]: 'SPONSOR',
    [EventType.SPONSOR_TREASURY_ADDED]: 'SPONSOR',
    [EventType.SPONSOR_TREASURY_REMOVED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_INVITED]: 'SPONSOR',
    [EventType.SCOUT_INVITE]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_REMOVED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_INVITE_REMOVED]: 'SPONSOR',
    [EventType.SPONSOR_MEMBER_ACCEPTED]: 'SPONSOR',
    [EventType.SPONSOR_PROFILE_EDITED]: 'SPONSOR',
    [EventType.SUBMISSION_NOTE_CHANGED]: 'SPONSOR',
    [EventType.SUBMISSION_PAYMENT_DATE_EDITED]: 'SPONSOR',
    [EventType.PLATFORM_ADMIN_ARCHIVED_OR_UNARCHIVED]: 'SPONSOR',
    [EventType.AUTOMATION_LOG]: 'SPONSOR',
    [EventType.PLATFORM_ADMIN_SUBMISSION_STATUS_EDITED]: 'TALENT',
    [EventType.SYSTEM_STATUS_IN_REVIEW]: 'PUBLIC',
    [EventType.COMMENT_PINNED]: 'PUBLIC',
    [EventType.COMMENT_UNPINNED]: 'PUBLIC',
  };

  return mapping[eventType];
}

class EventLoggerService implements EventLogger {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async log<T extends EventType>(params: Log<T>): Promise<LogType | undefined> {
    const log = await this.bulkLog([params]);
    return log[0];
  }

  async bulkLog(events: Array<Log<EventType>>): Promise<LogType[]> {
    // Process events and check for GOD role when actorType is SPONSOR
    const processedEvents = await Promise.all(
      events.map(async (event) => {
        let finalActorType = event.actor.type;

        if (
          event.actor.type === 'SPONSOR' &&
          event.actor.id &&
          event.entities?.sponsorId
        ) {
          // Check if user has GOD role and is not part of the sponsor
          const user = await this.prisma.user.findUnique({
            where: {
              id: event.actor.id,
              role: 'GOD',
              UserSponsors: {
                none: {
                  sponsorId: event.entities?.sponsorId,
                },
              },
            },
            select: { role: true },
          });

          if (user) {
            finalActorType = 'PLATFORM_ADMIN';
          }
        } else if (
          event.actor.type === 'TALENT' &&
          event.entities?.submissionId
        ) {
          // Check if user has GOD role and is not creator of the submission
          const user = await this.prisma.user.findUnique({
            where: {
              id: event.actor.id,
              role: 'GOD',
              Submission: {
                none: {
                  id: event.entities?.submissionId,
                },
              },
            },
            select: { role: true },
          });

          if (user?.role === 'GOD') {
            finalActorType = 'PLATFORM_ADMIN';
          }
        }

        return {
          eventType: event.eventType,
          subType: event.subType || null,
          actorId: event.actor.id,
          actorType: finalActorType,
          listingId: event.entities?.listingId || null,
          submissionId: event.entities?.submissionId || null,
          powId: event.entities?.powId || null,
          sponsorId: event.entities?.sponsorId || null,
          commentId: event.entities?.commentId || null,
          milestoneId: event.entities?.milestoneId || null,
          data: event.data as Prisma.JsonObject,
          visibility: event.visibility || getDefaultVisibility(event.eventType),
          eventTime: event.eventTime || new Date(),
        } as Prisma.EventLogCreateManyInput;
      }),
    );

    try {
      const logs = await this.prisma.$transaction(async (tx) => {
        const logs: LogType[] = [];
        for (const event of processedEvents) {
          const log = await tx.eventLog.create({
            data: event,
            include: prismaLogInclude,
          });
          logs.push(log as unknown as LogType);
          await createNotificationFromEvent(log as unknown as LogType);
        }
        return logs;
      });

      logger.info(`Successfully logged ${events.length} events`);
      return logs;
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
