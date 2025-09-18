import { render } from '@react-email/render';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@/prisma';

import { fromEmail, replyToEmail } from '@/features/emails/utils/fromEmails';
import { resend } from '@/features/emails/utils/resend';
import {
  type Notification,
  notificationInclude,
} from '@/features/notifications/queries/useNotifications';
import { prepareReactEmail } from '@/features/notifications/services/email-service';
import {
  NotificationChannel,
  type NotificationType,
} from '@/features/notifications/types';

import { CronLogger } from '../lib/logger';
import type { CronJobResult } from '../types';

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
    });

    for (const notification of notifications) {
      const emailData = await prepareReactEmail(
        notification as unknown as Notification<NotificationType>,
      );
      if (emailData) {
        const html = await render(emailData.component);
        await resend.emails.send({
          from: fromEmail,
          to: [notification.receiver.email],
          subject: emailData.subject,
          html,
          replyTo: replyToEmail,
        });
        await prisma.notification.update({
          where: { id: notification.id },
          data: { deliveredAt: new Date() },
        });
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
