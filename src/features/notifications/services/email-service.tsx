import { CommentTemplate } from '@/email-templates/commentTemplate';
import { DeadlineThreeDaysTemplate } from '@/email-templates/Deadline/deadline3dayTemplate';
import { LikeTemplate } from '@/email-templates/likeTemplate';
import { ListingEditedTemplate } from '@/email-templates/Listing/listingEditedTemplate';
import { ScoutInviteTemplate } from '@/email-templates/Listing/scoutInviteTemplate';
import { SponsorMemberAcceptedTemplate } from '@/email-templates/Sponsor/sponsorMemberAcceptedTemplate';
import { SubmissionCreatedTemplate } from '@/email-templates/Submission/submissionCreatedTemplate';
import { SubmissionEditedTemplate } from '@/email-templates/Submission/submissionEditedTemplate';
import { SubmissionRejectedTemplate } from '@/email-templates/Submission/submissionRejectedTemplate';
import { TreasuryProposalStatusChangedTemplate } from '@/email-templates/Treasury/treasuryProposalStatusChangedTemplate';
import { PaymentReceivedTemplate } from '@/email-templates/Winners/paymentReceivedTemplate';
import { WinnersAnnouncedTemplate } from '@/email-templates/Winners/winnersAnnouncedTemplate';
import { WinnersTemplate } from '@/email-templates/Winners/winnersTemplate';
import { getBountyUrl } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

import { InviteMemberTemplate } from '@/features/emails/components/inviteMemberTemplate';
import { type Listing, type Rewards } from '@/features/listings/types';

import { type Notification } from '../queries/useNotifications';
import { type NotificationDataMap, NotificationType } from '../types';

export async function prepareReactEmail<T extends NotificationType>(
  notification: Notification<T>,
): Promise<{ component: React.ReactElement; subject: string } | undefined> {
  let component: React.ReactElement | undefined;
  let subject: string = '';

  switch (notification.type) {
    case NotificationType.SUBMISSION_CREATED:
      component = <SubmissionCreatedTemplate notification={notification} />;
      subject = `New submission for ${notification.listing?.title}`;
      break;

    case NotificationType.SUBMISSION_EDITED:
      component = <SubmissionEditedTemplate notification={notification} />;
      subject = `Submission updated for ${notification.listing?.title}`;
      break;

    case NotificationType.LISTING_COMMENT:
      component = <CommentTemplate notification={notification} />;
      subject = `New comment on ${notification.listing?.title}`;
      break;
    case NotificationType.SUBMISSION_COMMENT:
      component = <CommentTemplate notification={notification} />;
      subject = `New comment on your submission`;
      break;
    case NotificationType.POW_COMMENT:
      component = <CommentTemplate notification={notification} />;
      subject = `New comment on your proof of work`;
      break;
    case NotificationType.NOTE_CREATED:
      component = <CommentTemplate notification={notification} />;
      subject = `New note on submission #${notification.submission?.sequentialId}`;
      break;
    case NotificationType.COMMENT_REPLY:
      component = <CommentTemplate notification={notification} />;
      subject = `New reply to your comment`;
      break;
    case NotificationType.COMMENT_MENTIONED_YOU:
      component = <CommentTemplate notification={notification} />;
      subject = `You've been mentioned in a comment`;
      break;
    case NotificationType.COMMENT_PINNED:
      component = <CommentTemplate notification={notification} />;
      subject = `Comment has been pinned`;
      break;

    case NotificationType.LISTING_WINNERS_ANNOUNCED:
      component = (
        <WinnersAnnouncedTemplate
          name={notification.receiver.name}
          listingName={notification.listing?.title!}
          link={getBountyUrl(notification.listing as unknown as Listing)}
        />
      );
      subject = `Winners announced for ${notification.listing?.title}`;
      break;

    case NotificationType.LISTING_EDITED:
      const eventDataEdit =
        notification.data as NotificationDataMap['LISTING_EDITED'];
      const deadlineChanged = eventDataEdit.changes.find(
        (change) => change.field === 'deadline',
      );
      component = <ListingEditedTemplate notification={notification} />;
      subject = deadlineChanged
        ? `Deadline updated for ${notification.listing?.title}`
        : `${notification.listing?.title} has been updated`;
      break;

    case NotificationType.DEADLINE_IN_3_DAYS:
      component = (
        <DeadlineThreeDaysTemplate
          name={notification.receiver.name}
          listingName={notification.listing?.title!}
          link={getBountyUrl(notification.listing as unknown as Listing)}
        />
      );
      subject = `Reminder: ${notification.listing?.title} deadline in 3 days`;
      break;

    case NotificationType.SUBMISSION_APPROVED:
      component = (
        <WinnersTemplate
          name={notification.receiver.name}
          listingName={notification.listing?.title!}
          listingType={notification.listing?.type!}
          sponsorName={notification.sponsor?.name!}
          pocSocials={notification.listing?.pocSocials || null}
        />
      );
      subject = `Congratulations! You won ${notification.listing?.title}`;
      break;

    case NotificationType.SUBMISSION_PAID:
      const isUsdBased = notification.listing?.token === 'Any';
      component = (
        <PaymentReceivedTemplate
          name={notification.receiver.name}
          amount={
            notification.listing?.rewards[
              notification.submission?.winnerPosition! as keyof Rewards
            ] ?? 0
          }
          tokenName={
            isUsdBased
              ? notification.listing?.token!
              : notification.submission?.token!
          }
          walletAddress={null}
          username={notification.receiver.username}
          isUSDbased={isUsdBased}
        />
      );
      subject = `Payment received for ${notification.listing?.title}`;
      break;

    case NotificationType.SUBMISSION_REJECTED:
      component = (
        <SubmissionRejectedTemplate
          name={notification.receiver.name}
          listingName={notification.listing?.title!}
          link={`${getBountyUrl(notification.listing as unknown as Listing)}${notification.submission?.sequentialId}`}
        />
      );
      subject = `Submission rejected for ${notification.listing?.title}`;
      break;

    case NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED:
      const treasuryData =
        notification.data as NotificationDataMap['TREASURY_PROPOSAL_STATUS_CHANGED'];
      component = (
        <TreasuryProposalStatusChangedTemplate
          notification={
            notification as Notification<'TREASURY_PROPOSAL_STATUS_CHANGED'>
          }
        />
      );
      subject = `Treasury proposal ${treasuryData.status}`;
      break;

    case NotificationType.SPONSOR_MEMBER_INVITED:
      const eventDataInvite =
        notification.data as NotificationDataMap['SPONSOR_MEMBER_INVITED'];
      component = (
        <InviteMemberTemplate
          sponsorName={notification.sponsor?.name!}
          senderName={notification.receiver.name}
          link={`${getURL()}signup?invite=${eventDataInvite.token}`}
        />
      );
      subject = `You've been invited to join ${notification.sponsor?.name}`;
      break;

    case NotificationType.SPONSOR_MEMBER_ACCEPTED:
      component = <SponsorMemberAcceptedTemplate notification={notification} />;
      subject = `${notification.actor?.name || notification.actor?.username} joined your team`;
      break;

    case NotificationType.SCOUT_INVITE:
      component = (
        <ScoutInviteTemplate
          name={notification.receiver.name}
          link={getBountyUrl(notification.listing as unknown as Listing)}
          listingName={notification.listing?.title!}
          sponsorName={notification.sponsor?.name!}
        />
      );
      subject = `You're invited to participate in ${notification.listing?.title}`;
      break;

    case NotificationType.LIKE:
      let likeSubject = '';
      if (notification.submission) {
        likeSubject = `${notification.actor?.username} liked your submission`;
      } else if (notification.pow) {
        likeSubject = `${notification.actor?.username} liked your proof of work`;
      } else if (notification.listing) {
        likeSubject = `${notification.actor?.username} liked your listing`;
      }
      component = <LikeTemplate notification={notification} />;
      subject = likeSubject;
      break;

    case NotificationType.WEEKLY_ROUNDUP:
      break;

    case NotificationType.NEW_LISTING_FOR_SKILLS:
      break;

    case NotificationType.PRODUCT_UPDATES_AND_NEWS:
      break;
  }

  if (component && subject) {
    return { component, subject };
  }

  return undefined;
}
