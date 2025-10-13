import { render } from '@react-email/render';
import { type NextApiRequest, type NextApiResponse } from 'next';

import { prisma } from '@/prisma';

import {
  type Notification,
  notificationInclude,
} from '@/features/notifications/queries/useNotifications';
import { prepareReactEmail } from '@/features/notifications/services/email-service';
import { type NotificationType } from '@/features/notifications/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const type = req.query.type as NotificationType;

  const notification = await prisma.notification.findFirst({
    where: {
      type,
    },
    include: notificationInclude,
  });

  const emailData = await prepareReactEmail(
    notification as unknown as Notification<NotificationType>,
  );
  if (!emailData) {
    res.status(404).send('Email data not found');
    return;
  }
  const renderComponent = await render(emailData.component);

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Preview</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        ${renderComponent}
      </body>
    </html>
  `);
}
