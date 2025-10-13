import { render } from '@react-email/render';
import { createHmac } from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@/prisma';
import { getURL } from '@/utils/validUrl';

import {
  type Notification,
  notificationInclude,
} from '@/features/notifications/queries/useNotifications';
import { prepareReactEmail } from '@/features/notifications/services/email-service';
import {
  NotificationChannel,
  type NotificationType,
} from '@/features/notifications/types';
import {
  fromEmail,
  replyToEmail,
} from '@/features/notifications/utils/fromEmails';
import { resend } from '@/features/notifications/utils/resend';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

const generateUnsubscribeURL = (email: string) => {
  const signature = createHmac('sha256', process.env.UNSUB_SECRET!)
    .update(email)
    .digest('hex');
  return `${getURL()}/api/email/unsubscribe?email=${encodeURIComponent(
    email,
  )}&signature=${signature}`;
};

export async function sendEmailNotifications(): Promise<CronJobResult> {
  const logger = new CronLogger('send-email-notifications');

  try {
    dayjs.extend(utc);

    const notifications = await prisma.notification.findMany({
      where: {
        channel: NotificationChannel.EMAIL,
        deliveredAt: null,
      },
      include: { ...notificationInclude, receiver: true },
      take: 25,
      orderBy: [{ createdAt: 'asc' }],
    });

    for (const notification of notifications) {
      const emailData = await prepareReactEmail(
        notification as unknown as Notification<NotificationType>,
      );
      if (emailData) {
        const html = await render(emailData.component);

        const [isBlocked, isUnsubscribed] = await Promise.all([
          prisma.blockedEmail.findUnique({
            where: { email: notification.receiver.email },
          }),
          prisma.unsubscribedEmail.findUnique({
            where: { email: notification.receiver.email },
          }),
        ]);

        if (isBlocked || isUnsubscribed) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { deliveredAt: new Date() },
          });
          continue;
        }

        const unsubscribeURL = generateUnsubscribeURL(
          notification.receiver.email,
        );

        await resend.emails.send({
          from: fromEmail,
          to: [notification.receiver.email],
          subject: emailData.subject,
          html: html.replace('{{unsubscribeUrl}}', unsubscribeURL),
          replyTo: replyToEmail,
        });
        await prisma.notification.update({
          where: { id: notification.id },
          data: { deliveredAt: new Date() },
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return {
      success: true,
      message: 'Job completed successfully',
    };
  } catch (error) {
    logger.error('Job failed', error);
    return {
      success: false,
      message: `Job failed: ${error}`,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
