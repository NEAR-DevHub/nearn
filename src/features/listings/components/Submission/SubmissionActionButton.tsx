import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Loader2, Pencil } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import React, { useState } from 'react';

import { SurveyModal } from '@/components/shared/Survey';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { AuthWrapper } from '@/features/auth/components/AuthWrapper';

import { userAllSubmissionsQuery } from '../../queries/user-all-submissions';
import { userSubmissionQuery } from '../../queries/user-submission-status';
import { type Listing } from '../../types';
import { isDeadlineOver } from '../../utils/deadline';
import {
  getRegionTooltipLabel,
  userRegionEligibilty,
} from '../../utils/region';
import { getListingDraftStatus } from '../../utils/status';
import { ShareListing } from '../ListingPage/ShareListing';
import { EasterEgg } from './EasterEgg';
import { SubmissionDrawer } from './SubmissionDrawer';
import { SubmissionUnderReviewModal } from './SubmissionUnderReviewModal';

interface Props {
  listing: Listing;
  isTemplate?: boolean;
}

const InfoWrapper = ({
  children,
  isUserEligibleByRegion,
  hasHackathonStarted,
  regionTooltipLabel,
  hackathonStartDate,
}: {
  children: React.ReactNode;
  isUserEligibleByRegion: boolean;
  hasHackathonStarted: boolean;
  regionTooltipLabel: string;
  hackathonStartDate: dayjs.Dayjs | null;
}) => {
  const shouldShowTooltip = !(hasHackathonStarted && isUserEligibleByRegion);
  const tooltipContent = !isUserEligibleByRegion
    ? regionTooltipLabel
    : !hasHackathonStarted
      ? `This track will open for submissions on ${hackathonStartDate?.format('DD MMMM, YYYY')}`
      : null;

  if (shouldShowTooltip && tooltipContent) {
    return (
      <div className="group relative w-full">
        {children}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-md bg-gray-50 px-3 py-1.5 text-xs text-slate-700 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          {tooltipContent}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const SubmissionActionButton = ({
  listing,
  isTemplate = false,
}: Props) => {
  const {
    id,
    status,
    multipleSubmissionRule,
    submissionLimit,
    isPublished,
    region,
    type,
    Hackathon,
    isWinnersAnnounced,
  } = listing;

  const [isEasterEggOpen, setEasterEggOpen] = useState(false);
  const [showUnderReviewModal, setShowUnderReviewModal] = useState(false);
  const [isEditMultipleMode, setIsEditMultipleMode] = useState(false);

  const { user } = useUser();
  const queryClient = useQueryClient();

  const { status: authStatus } = useSession();

  const isAuthenticated = authStatus === 'authenticated';

  const isUserEligibleByRegion = userRegionEligibilty({
    region,
    userLocation: user?.location,
  });

  const { data: submission, isLoading: isUserSubmissionLoading } = useQuery({
    ...userSubmissionQuery(id!, user?.id),
    enabled: isAuthenticated,
  });

  const { data: allSubmissions = [], isLoading: isAllSubmissionsLoading } =
    useQuery({
      ...userAllSubmissionsQuery(id!, user?.id),
      enabled: isAuthenticated && listing.submissionLimit === 'multiple',
    });

  const isSubmitted = submission?.isSubmitted ?? false;
  const submissionStatus = submission?.status;
  const posthog = usePostHog();
  const router = useRouter();
  const { query } = router;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDrawerClose = () => {
    setIsEditMultipleMode(false);
    onClose();
  };

  const regionTooltipLabel = getRegionTooltipLabel(region);

  const bountyDraftStatus = getListingDraftStatus(status, isPublished);

  const isProject = type === 'project';
  const isMultipleSubmission = submissionLimit === 'multiple';

  // Check if user has pending submission
  const hasPendingSubmission = allSubmissions.some(
    (sub) => sub.status === 'Pending',
  );

  const buttonState = getButtonState();

  const handleSubmit = () => {
    // Handle Submit Now click for afterReview rule with pending submission
    if (
      isMultipleSubmission &&
      multipleSubmissionRule === 'afterReview' &&
      hasPendingSubmission
    ) {
      setShowUnderReviewModal(true);
      return;
    }

    onOpen();
    if (buttonState === 'submit') {
      posthog.capture('start_submission');
    } else if (buttonState === 'edit') {
      posthog.capture('edit_submission');
    }
  };

  const hackathonStartDate = Hackathon?.startDate
    ? dayjs(Hackathon?.startDate)
    : null;

  const hasHackathonStarted = hackathonStartDate
    ? dayjs().isAfter(hackathonStartDate)
    : true;

  let buttonText;
  let buttonBG;
  let isBtnDisabled;
  let btnLoadingText;

  function getButtonState() {
    if (isSubmitted && submission?.label === 'Spam') return 'spam';

    if (isMultipleSubmission) {
      return 'submit';
    }

    if (isSubmitted && submissionStatus === 'Rejected') return 'rejected';
    if (isSubmitted) {
      if (submission?.label !== 'New' || submissionStatus !== 'Pending')
        return 'freeze';

      return 'edit';
    }
    return 'submit';
  }

  switch (buttonState) {
    case 'spam':
      buttonText = 'Application Flagged as Spam';
      buttonBG = 'bg-red-600';
      isBtnDisabled = true;
      btnLoadingText = null;
      break;
    case 'rejected':
      buttonText = 'Application Rejected';
      buttonBG = 'bg-red-600';
      isBtnDisabled = true;
      btnLoadingText = null;
      break;
    case 'edit':
      buttonText = isProject ? 'Edit Application' : 'Edit Submission';
      isBtnDisabled = false;
      btnLoadingText = null;
      break;
    case 'freeze':
      buttonText = 'Edit Locked';
      buttonBG = 'bg-gray-500';
      isBtnDisabled = true;
      btnLoadingText = null;
      break;

    default:
      buttonText = isProject ? 'Apply Now' : 'Submit Now';
      buttonBG = 'bg-black';
      isBtnDisabled = Boolean(
        isDeadlineOver(listing.deadline ?? undefined) ||
          (user?.id &&
            user?.isTalentFilled &&
            ((bountyDraftStatus !== 'PUBLISHED' && !query['preview']) ||
              !hasHackathonStarted ||
              !isUserEligibleByRegion)),
      );
      btnLoadingText = 'Checking Submission..';
  }
  if (isWinnersAnnounced) {
    buttonText = 'Winners Announced';
    buttonBG = 'bg-gray-500';
  }

  const {
    isOpen: isSurveyOpen,
    onOpen: onSurveyOpen,
    onClose: onSurveyClose,
  } = useDisclosure();

  const surveyId = '018c6743-c893-0000-a90e-f35d31c16692';

  return (
    <>
      {isOpen && (
        <SubmissionDrawer
          onClose={handleDrawerClose}
          isOpen={isOpen}
          editMode={buttonState === 'edit' || isEditMultipleMode}
          listing={listing}
          submission={isEditMultipleMode ? undefined : submission}
          submissions={isEditMultipleMode ? allSubmissions : undefined}
          isTemplate={isTemplate}
          showEasterEgg={() => setEasterEggOpen(true)}
          onSurveyOpen={onSurveyOpen}
          refetchSubmissions={async () => {
            await queryClient.invalidateQueries({
              queryKey: userAllSubmissionsQuery(id!, user?.id).queryKey,
            });
          }}
        />
      )}
      {isSurveyOpen &&
        (!user?.surveysShown || !(surveyId in user.surveysShown)) && (
          <SurveyModal
            isOpen={isSurveyOpen}
            onClose={onSurveyClose}
            surveyId={surveyId}
          />
        )}
      {isEasterEggOpen && (
        <EasterEgg
          isOpen={isEasterEggOpen}
          onClose={() => setEasterEggOpen(false)}
          isProject={isProject}
        />
      )}
      {showUnderReviewModal && (
        <SubmissionUnderReviewModal
          isOpen={showUnderReviewModal}
          onClose={() => setShowUnderReviewModal(false)}
        />
      )}

      <div className="ph-no-capture fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 items-start gap-2 bg-white px-3 py-4 pt-2 md:static md:translate-x-0 md:px-0 md:py-0">
        <InfoWrapper
          isUserEligibleByRegion={isUserEligibleByRegion}
          hasHackathonStarted={hasHackathonStarted}
          regionTooltipLabel={regionTooltipLabel}
          hackathonStartDate={hackathonStartDate}
        >
          <AuthWrapper className="w-full">
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full gap-2">
                <div className="md:hidden">
                  <ShareListing
                    source="listing"
                    className="h-12"
                    listing={listing}
                  />
                </div>
                <Button
                  className={cn(
                    'h-12 flex-1 gap-4 text-lg',
                    'disabled:opacity-70',
                    buttonBG,
                    'hover:opacity-90',
                    buttonState === 'edit' &&
                      'border-brand-green text-gray-600 hover:text-gray-900',
                  )}
                  disabled={isBtnDisabled}
                  onClick={handleSubmit}
                  variant={buttonState === 'edit' ? 'outline' : 'default'}
                >
                  {isUserSubmissionLoading || isAllSubmissionsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>{btnLoadingText}</span>
                    </>
                  ) : (
                    <>
                      {buttonState === 'edit' && <Pencil />}
                      <span>{buttonText}</span>
                    </>
                  )}
                </Button>
                {isMultipleSubmission && allSubmissions.length > 0 && (
                  <Button
                    className={cn(
                      'mb-12 h-12 border-brand-green text-gray-600 hover:text-gray-900 md:mb-5 md:hidden',
                    )}
                    variant="outline"
                    onClick={() => {
                      posthog.capture('view_submissions');
                      setIsEditMultipleMode(true);
                      onOpen();
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {/* Show Edit Submissions button for multiple submissions with existing submissions */}
              {isMultipleSubmission && allSubmissions.length > 0 && (
                <Button
                  className={cn(
                    'hidden h-12 gap-2 text-lg md:flex',
                    'mb-12 md:mb-5',
                    'border-brand-green text-gray-600 hover:text-gray-900',
                  )}
                  onClick={() => {
                    posthog.capture('view_submissions');
                    setIsEditMultipleMode(true);
                    onOpen();
                  }}
                  variant="outline"
                >
                  <Pencil className="h-4 w-4" />
                  <span>
                    {isProject ? 'Edit Applications' : 'Edit Submissions'}
                  </span>
                </Button>
              )}
            </div>
          </AuthWrapper>
        </InfoWrapper>
      </div>
    </>
  );
};
