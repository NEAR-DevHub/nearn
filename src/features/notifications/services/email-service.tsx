import { CommentTemplate } from '@/email-templates/commentTemplate';
import { DeadlineThreeDaysTemplate } from '@/email-templates/Deadline/deadline3dayTemplate';
import { DeadlineEndedTemplate } from '@/email-templates/Deadline/deadlineEndedTemplate';
import { DeadlineExceededbyWeekTemplate } from '@/email-templates/Deadline/deadlineExceededbyWeekTemplate';
import { InviteMemberTemplate } from '@/email-templates/inviteMemberTemplate';
import { LikeTemplate } from '@/email-templates/likeTemplate';
import { ListingEditedTemplate } from '@/email-templates/Listing/listingEditedTemplate';
import { NewListingTemplate } from '@/email-templates/Listing/newListingTemplate';
import { ScoutInviteTemplate } from '@/email-templates/Listing/scoutInviteTemplate';
import { WeeklyRoundupTemplate } from '@/email-templates/Listing/weeklyRoundupTemplate';
import { MilestoneApprovedTemplate } from '@/email-templates/Milestones/milestoneApprovedTemplate';
import { MilestoneCreatedTemplate } from '@/email-templates/Milestones/milestoneCreatedTemplate';
import { MilestoneDeadlineComingUpTemplate } from '@/email-templates/Milestones/milestoneDeadlineComingUpTemplate';
import { MilestonesEditedTemplate } from '@/email-templates/Milestones/milestonesEditedTemplate';
import { SubmissionCancelledTemplate } from '@/email-templates/Milestones/submissionCancelledTemplate';
import { SponsorMemberAcceptedTemplate } from '@/email-templates/Sponsor/sponsorMemberAcceptedTemplate';
import { SubmissionCreatedTemplate } from '@/email-templates/Submission/submissionCreatedTemplate';
import { SubmissionEditedTemplate } from '@/email-templates/Submission/submissionEditedTemplate';
import { SubmissionRejectedTemplate } from '@/email-templates/Submission/submissionRejectedTemplate';
import { SubmissionTemplate } from '@/email-templates/Submission/submissionTemplate';
import { TreasuryProposalStatusChangedTemplate } from '@/email-templates/Treasury/treasuryProposalStatusChangedTemplate';
import { PaymentReceivedTemplate } from '@/email-templates/Winners/paymentReceivedTemplate';
import { WinnersAnnouncedTemplate } from '@/email-templates/Winners/winnersAnnouncedTemplate';
import { WinnersTemplate } from '@/email-templates/Winners/winnersTemplate';
import { getBountyUrl as getBountyUrlInternal } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

import { type Listing, type Rewards } from '@/features/listings/types';

import { type Notification } from '../queries/useNotifications';
import { type NotificationDataMap, NotificationType } from '../types';

const getBountyUrl = (notification: Notification<NotificationType>) => {
  return getBountyUrlInternal({
    ...(notification.listing as unknown as Listing),
    sponsor: notification.sponsor,
  });
};

type EmailHandler<T extends NotificationType> = (
  notification: Notification<T>,
) => { component: React.ReactElement; subject: string } | undefined;

const emailHandlers: {
  [K in NotificationType]: EmailHandler<K>;
} = {
  [NotificationType.SUBMISSION_CREATED]: (notification) => ({
    component: <SubmissionCreatedTemplate notification={notification} />,
    subject: `New submission for ${notification.listing?.title}`,
  }),

  [NotificationType.SUBMISSION_EDITED]: (notification) => ({
    component: <SubmissionEditedTemplate notification={notification} />,
    subject: `Submission updated for ${notification.listing?.title}`,
  }),

  [NotificationType.LISTING_COMMENT]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `New comment on ${notification.listing?.title}`,
  }),

  [NotificationType.SUBMISSION_COMMENT]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `New comment on your submission`,
  }),

  [NotificationType.POW_COMMENT]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `New comment on your proof of work`,
  }),

  [NotificationType.NOTE_CREATED]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `New note on submission #${notification.submission?.sequentialId}`,
  }),

  [NotificationType.COMMENT_REPLY]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `New reply to your comment`,
  }),

  [NotificationType.COMMENT_MENTIONED_YOU]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `You've been mentioned in a comment`,
  }),

  [NotificationType.COMMENT_PINNED]: (notification) => ({
    component: <CommentTemplate notification={notification} />,
    subject: `Comment has been pinned`,
  }),

  [NotificationType.LISTING_WINNERS_ANNOUNCED]: (notification) => ({
    component: (
      <WinnersAnnouncedTemplate
        name={notification.receiver.name}
        listingName={notification.listing?.title!}
        link={getBountyUrl(notification)}
      />
    ),
    subject: `Winners announced for ${notification.listing?.title}`,
  }),

  [NotificationType.LISTING_EDITED]: (notification) => {
    const eventDataEdit =
      notification.data as NotificationDataMap['LISTING_EDITED'];
    const deadlineChanged = eventDataEdit.changes.find(
      (change) => change.field === 'deadline',
    );
    return {
      component: <ListingEditedTemplate notification={notification} />,
      subject: deadlineChanged
        ? `Deadline updated for ${notification.listing?.title}`
        : `${notification.listing?.title} has been updated`,
    };
  },

  [NotificationType.DEADLINE_IN_3_DAYS]: (notification) => ({
    component: (
      <DeadlineThreeDaysTemplate
        name={notification.receiver.name}
        listingName={notification.listing?.title!}
        link={getBountyUrl(notification)}
      />
    ),
    subject: `Reminder: ${notification.listing?.title} deadline in 3 days`,
  }),

  [NotificationType.SUBMISSION_APPROVED]: (notification) => ({
    component: (
      <WinnersTemplate
        name={notification.receiver.name}
        listingName={notification.listing?.title!}
        listingType={notification.listing?.type!}
        sponsorName={notification.sponsor?.name!}
        pocSocials={notification.listing?.pocSocials || null}
        link={`${getBountyUrl(notification)}${notification.submission?.sequentialId}/`}
      />
    ),
    subject: `Congratulations! You won ${notification.listing?.title}`,
  }),

  [NotificationType.SUBMISSION_PAID]: (notification) => {
    const isUsdBased = notification.listing?.token === 'Any';
    return {
      component: (
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
      ),
      subject: `Payment received for ${notification.listing?.title}`,
    };
  },

  [NotificationType.SUBMISSION_REJECTED]: (notification) => ({
    component: (
      <SubmissionRejectedTemplate
        name={notification.receiver.name}
        listingName={notification.listing?.title!}
        link={`${getBountyUrl(notification)}${notification.submission?.sequentialId}`}
      />
    ),
    subject: `Submission rejected for ${notification.listing?.title}`,
  }),

  [NotificationType.TREASURY_PROPOSAL_STATUS_CHANGED]: (notification) => {
    const treasuryData =
      notification.data as NotificationDataMap['TREASURY_PROPOSAL_STATUS_CHANGED'];
    return {
      component: (
        <TreasuryProposalStatusChangedTemplate
          notification={
            notification as Notification<'TREASURY_PROPOSAL_STATUS_CHANGED'>
          }
        />
      ),
      subject: `Treasury proposal ${treasuryData.status}`,
    };
  },

  [NotificationType.SPONSOR_MEMBER_INVITED]: (notification) => {
    const eventDataInvite =
      notification.data as NotificationDataMap['SPONSOR_MEMBER_INVITED'];
    return {
      component: (
        <InviteMemberTemplate
          sponsorName={notification.sponsor?.name!}
          senderName={notification.receiver.name}
          link={`${getURL()}signup?invite=${eventDataInvite.token}`}
        />
      ),
      subject: `You've been invited to join ${notification.sponsor?.name}`,
    };
  },

  [NotificationType.SPONSOR_MEMBER_ACCEPTED]: (notification) => ({
    component: <SponsorMemberAcceptedTemplate notification={notification} />,
    subject: `${notification.actor?.name || notification.actor?.username} joined your team`,
  }),

  [NotificationType.SCOUT_INVITE]: (notification) => ({
    component: (
      <ScoutInviteTemplate
        name={notification.receiver.name}
        link={getBountyUrl(notification)}
        listingName={notification.listing?.title!}
        sponsorName={notification.sponsor?.name!}
      />
    ),
    subject: `You're invited to participate in ${notification.listing?.title}`,
  }),

  [NotificationType.LIKE]: (notification) => {
    let likeSubject = '';
    if (notification.submission) {
      likeSubject = `${notification.actor?.username} liked your submission`;
    } else if (notification.pow) {
      likeSubject = `${notification.actor?.username} liked your proof of work`;
    } else if (notification.commentId) {
      likeSubject = `${notification.actor?.username} liked your comment`;
    }
    return {
      component: <LikeTemplate notification={notification} />,
      subject: likeSubject,
    };
  },

  [NotificationType.WEEKLY_ROUNDUP]: (notification) => {
    const eventDataWeeklyRoundup =
      notification.data as NotificationDataMap['WEEKLY_ROUNDUP'];
    return {
      component: (
        <WeeklyRoundupTemplate
          name={notification.receiver.name}
          listings={eventDataWeeklyRoundup.listings}
          userSkills={eventDataWeeklyRoundup.userSkills}
        />
      ),
      subject: `Weekly listing roundup`,
    };
  },

  [NotificationType.NEW_LISTING_FOR_SKILLS]: (notification) => ({
    component: (
      <NewListingTemplate
        name={notification.receiver.name}
        link={getBountyUrl(notification)}
        listing={
          { ...notification.listing, sponsor: notification.sponsor! } as any
        }
      />
    ),
    subject: `${notification.sponsor?.name} has a new ${notification.listing?.type} listing just for you!`,
  }),

  [NotificationType.PRODUCT_UPDATES_AND_NEWS]: () => undefined,

  [NotificationType.SUBMISSION_RECEIVED]: (notification) => ({
    component: (
      <SubmissionTemplate
        listingName={notification.listing?.title!}
        type={notification.listing?.type!}
        name={notification.receiver.name}
        link={`${getBountyUrl(notification)}${notification.submission?.sequentialId}/`}
      />
    ),
    subject: `Submission received!`,
  }),

  [NotificationType.DEADLINE_ENDED]: (notification) => ({
    component: (
      <DeadlineEndedTemplate
        name={notification.receiver.name}
        listingName={notification.listing?.title!}
        link={getBountyUrl(notification)}
      />
    ),
    subject: `Deadline ended for ${notification.listing?.title}`,
  }),

  [NotificationType.DEADLINE_EXCEEDED_BY_WEEK]: (notification) => ({
    component: (
      <DeadlineExceededbyWeekTemplate
        name={notification.receiver.name}
        listingName={notification.listing?.title!}
        link={getBountyUrl(notification)}
      />
    ),
    subject: `Deadline exceeded by week for ${notification.listing?.title}`,
  }),

  [NotificationType.MILESTONES_EDITED]: (notification) => ({
    component: <MilestonesEditedTemplate notification={notification} />,
    subject: `Milestones updated for ${notification.listing?.title}`,
  }),

  [NotificationType.MILESTONE_CREATED]: (notification) => {
    const eventDataMilestone =
      notification.data as NotificationDataMap['MILESTONE_CREATED'];
    const subject = eventDataMilestone?.useSingleMilestone
      ? `Full payment set for your winning submission for ${notification.listing?.title}`
      : `Milestone-based payment set for your winning submission for ${notification.listing?.title}`;
    return {
      component: (
        <MilestoneCreatedTemplate
          notification={notification}
          isSingleMilestone={eventDataMilestone?.useSingleMilestone ?? false}
        />
      ),
      subject,
    };
  },

  [NotificationType.MILESTONE_APPROVED]: (notification) => ({
    component: <MilestoneApprovedTemplate notification={notification} />,
    subject: `Milestone approved for ${notification.listing?.title}`,
  }),

  [NotificationType.SUBMISSION_CANCELLED]: (notification) => ({
    component: <SubmissionCancelledTemplate notification={notification} />,
    subject: `Milestones cancelled for ${notification.listing?.title}`,
  }),

  [NotificationType.MILESTONE_DEADLINE_IS_COMING_UP]: (notification) => ({
    component: (
      <MilestoneDeadlineComingUpTemplate notification={notification} />
    ),
    subject: `Milestone deadline reminder for ${notification.listing?.title}`,
  }),

  [NotificationType.SPONSOR_MILESTONE_DEADLINE_IS_COMING_UP]: (
    notification,
  ) => ({
    component: (
      <MilestoneDeadlineComingUpTemplate
        notification={notification}
        isSponsor={true}
      />
    ),
    subject: `Milestone deadline reminder for ${notification.listing?.title}`,
  }),
};

export async function prepareReactEmail<T extends NotificationType>(
  notification: Notification<T>,
): Promise<{ component: React.ReactElement; subject: string } | undefined> {
  const handler = emailHandlers[notification.type];
  if (!handler) {
    return undefined;
  }
  return handler(notification as any);
}
