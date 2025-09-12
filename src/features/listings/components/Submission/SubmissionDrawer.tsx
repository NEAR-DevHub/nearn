import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Info, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { EligibilityQuestionsForm } from '@/components/eligibility/EligibilityQuestions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { KycComponent } from '@/components/ui/KycComponent';
import { SideDrawer, SideDrawerContent } from '@/components/ui/side-drawer';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { tokenList } from '@/constants/tokenList';
import { type SubmissionWithUser } from '@/interface/submission';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';

import { useSubmissionDraft } from '../../hooks/useSubmissionDraft';
import { submissionCountQuery } from '../../queries/submission-count';
import { listingSubmissionsQuery } from '../../queries/submissions';
import { userAllSubmissionsQuery } from '../../queries/user-all-submissions';
import { userSubmissionQuery } from '../../queries/user-submission-status';
import { type Listing } from '../../types';
import { submissionSchema } from '../../utils/submissionFormSchema';
import {
  LikeAndComment,
  sponsorshipSubmissionStatus,
} from '../SubmissionsPage/SubmissionTable';
import { SubmissionTerms } from './SubmissionTerms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  listing: Listing;
  submission: SubmissionWithUser | undefined;
  submissions?: SubmissionWithUser[];
  isTemplate?: boolean;
  showEasterEgg: () => void;
  onSurveyOpen: () => void;
  isGodMode?: boolean;
  refetchSubmissions?: () => void;
}

type FormData = z.infer<ReturnType<typeof submissionSchema>>;

export const SubmissionDrawer = ({
  isOpen,
  onClose,
  editMode,
  listing,
  submission,
  submissions,
  isTemplate = false,
  showEasterEgg,
  onSurveyOpen,
  isGodMode = false,
  refetchSubmissions,
}: Props) => {
  const {
    id,
    type,
    eligibility,
    compensationType,
    token,
    minRewardAsk,
    maxRewardAsk,
  } = listing;

  const queryClient = useQueryClient();
  const isProject = type === 'project';
  const isHackathon = type === 'hackathon';
  const [isLoading, setIsLoading] = useState(false);
  const [isTOSModalOpen, setIsTOSModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [editFetched, setEditFetched] = useState(false);
  const [showSelectionView, setShowSelectionView] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<
    SubmissionWithUser | undefined
  >(submission);

  const { user, refetchUser } = useUser();
  const form: UseFormReturn<FormData> = useForm<FormData>({
    resolver: zodResolver(
      submissionSchema(listing, minRewardAsk || 0, maxRewardAsk || 0, user),
    ),
    defaultValues: {
      eligibilityAnswers:
        Array.isArray(listing.eligibility) && listing.eligibility.length > 0
          ? listing.eligibility.map((q) => ({
              question: q.question,
              answer: '',
            }))
          : [],
      token: token === 'Any' ? tokenList[0]?.tokenSymbol : undefined,
    },
  });

  const posthog = usePostHog();
  const router = useRouter();
  const { query } = router;

  const { loadDraft, clearDraft } = useSubmissionDraft(
    id || null,
    listing,
    form,
    editMode,
  );

  const handleClose = () => {
    setTermsAccepted(false);
    setShowSelectionView(false);
    setSelectedSubmission(submission);
    onClose();
  };

  const canEdit = (sub: SubmissionWithUser) => {
    return sub.label === 'New' && sub.status === 'Pending';
  };

  const handleEditSubmission = (sub: SubmissionWithUser) => {
    setSelectedSubmission(sub);
    setShowSelectionView(false);
  };

  useEffect(() => {
    if (editMode && submissions && !selectedSubmission) {
      setShowSelectionView(true);
    }
  }, [editMode, submissions, selectedSubmission]);

  const isAtLeastOneSpam = submissions?.some((sub) => sub.label === 'Spam');

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && selectedSubmission?.id && !showSelectionView) {
        try {
          const response = await api.get('/api/submission/get/', {
            params: { id: selectedSubmission.id },
          });

          const {
            link,
            tweet,
            otherInfo,
            eligibilityAnswers,
            ask,
            token,
            otherTokenDetails,
          } = response.data;

          form.reset({
            link,
            tweet,
            otherInfo,
            ask: ask || null,
            otherTokenDetails:
              otherTokenDetails && token === 'Other'
                ? otherTokenDetails
                : undefined,
            eligibilityAnswers: listing.eligibility?.map((e) => {
              const answer = eligibilityAnswers.find(
                (a: { question: string }) => a.question === e.question,
              )?.answer;
              return {
                question: e.question,
                answer: answer ?? '',
              };
            }),
            token,
          });
          setEditFetched(true);
        } catch (error) {
          console.error('Failed to fetch submission data', error);
          toast.error('Failed to load submission data');
        }
      } else if (!editMode && isOpen) {
        // Load saved draft for new submissions
        loadDraft();
      }
    };

    fetchData();
  }, [
    id,
    editMode,
    form.reset,
    isOpen,
    loadDraft,
    selectedSubmission,
    showSelectionView,
  ]);

  const onSubmit = async (data: FormData) => {
    posthog.capture('confirmed_submission');
    setIsLoading(true);
    try {
      const submissionEndpoint = editMode
        ? '/api/submission/update/'
        : '/api/submission/create/';

      await api.post(submissionEndpoint, {
        listingId: id,
        link: data.link || '',
        tweet: data.tweet || '',
        otherInfo: data.otherInfo || '',
        otherTokenDetails: data.otherTokenDetails || undefined,
        ask: data.ask || null,
        eligibilityAnswers: data.eligibilityAnswers || [],
        publicKey: data.publicKey,
        token: token === 'Any' ? data.token : undefined,
        submissionId: editMode ? selectedSubmission?.id : undefined,
        isGodMode: isGodMode,
      });

      const hideEasterEggFromSponsorIds = [
        '53cbd2eb-14e5-4b8a-b6fe-e18e0c885145', // network schoool
      ];

      const latestSubmissionNumber = (user?.Submission?.length ?? 0) + 1;
      if (
        !editMode &&
        latestSubmissionNumber === 1 &&
        !hideEasterEggFromSponsorIds.includes(listing.sponsorId || '')
      )
        showEasterEgg();
      if (!editMode && latestSubmissionNumber % 3 !== 0) onSurveyOpen();

      form.reset();
      await queryClient.invalidateQueries({
        queryKey: userSubmissionQuery(id!, user!.id).queryKey,
      });

      // Invalidate all submissions query if multiple submissions are allowed
      if (listing.submissionLimit === 'multiple') {
        await queryClient.invalidateQueries({
          queryKey: userAllSubmissionsQuery(id!, user!.id).queryKey,
        });
      }

      await refetchUser();

      if (!editMode) {
        await queryClient.invalidateQueries({
          queryKey: submissionCountQuery(id!).queryKey,
        });
      }

      if (editMode) {
        await queryClient.invalidateQueries({
          queryKey: listingSubmissionsQuery({ slug: listing.slug! }).queryKey,
        });
      }

      // Clear the saved draft after successful submission
      if (!editMode) {
        clearDraft();
      }

      toast.success(
        editMode
          ? 'Submission updated successfully'
          : 'Submission created successfully',
      );
      handleClose();
    } catch (e) {
      toast.error('Failed to submit. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SideDrawer open={isOpen} onClose={handleClose} className="scrollbar-none">
      <SideDrawerContent className="p-6 md:min-w-[672px]">
        {showSelectionView && submissions ? (
          <div className="flex h-full flex-col">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="font- text-lg font-semibold">
                  Your Submissions
                </h2>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Several requests have already been submitted. Editing is
                available for some of them
              </p>
            </div>
            <div className="w-full max-w-[95vw] flex-1 overflow-x-auto overflow-y-auto md:max-w-full">
              {submissions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No submissions found
                </div>
              ) : (
                <Table>
                  <TableBody>
                    {submissions.map((sub) => {
                      const submissionStatus = sponsorshipSubmissionStatus(sub);
                      const isEditable = canEdit(sub) && !isAtLeastOneSpam;

                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="min-w-[250px] pr-0">
                            <div
                              className={cn(
                                'flex items-center',
                                isEditable && 'cursor-pointer',
                              )}
                              onClick={() => {
                                if (isEditable) {
                                  handleEditSubmission(sub);
                                }
                              }}
                            >
                              <EarnAvatar
                                id={sub?.user?.id}
                                avatar={sub?.user?.photo || undefined}
                              />
                              <div className="ml-2 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate whitespace-nowrap text-sm font-medium text-slate-700">
                                    {sub?.user?.private
                                      ? sub?.user?.username
                                      : sub?.user?.name}
                                  </p>
                                  {sub?.user?.publicKey && (
                                    <KycComponent
                                      address={sub.user.publicKey}
                                      imageOnly
                                      variant="xs"
                                      listingSponsorId={listing?.sponsorId}
                                    />
                                  )}
                                </div>
                                <p className="truncate text-xs font-medium text-slate-500">
                                  {dayjs(sub.createdAt).format(
                                    "D MMM' YY h:mm A",
                                  )}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            className={cn(
                              'w-full justify-center py-2',
                              isEditable && 'cursor-pointer',
                            )}
                            onClick={() => {
                              if (isEditable) {
                                handleEditSubmission(sub);
                              }
                            }}
                          >
                            <span
                              className={cn(
                                'inline-flex whitespace-nowrap rounded-full px-3 py-1 text-center text-sm font-medium',
                                colorMap[
                                  submissionStatus as keyof typeof colorMap
                                ].bg,
                                colorMap[
                                  submissionStatus as keyof typeof colorMap
                                ].color,
                              )}
                            >
                              {submissionStatus}
                            </span>
                          </TableCell>
                          <TableCell className="w-full items-center justify-center py-2">
                            <LikeAndComment
                              id={sub.id}
                              bounty={listing}
                              submission={sub}
                              setUpdate={refetchSubmissions || (() => {})}
                            />
                          </TableCell>
                          <TableCell className="flex w-full items-center justify-end gap-2 px-0 py-2">
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isEditable}
                                className="ph-no-capture text-[13px] font-medium text-black"
                                onClick={() => handleEditSubmission(sub)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                            {!isEditable && (
                              <Tooltip
                                content="The submission can no longer be edited due to a status change or spam flag"
                                contentProps={{ className: 'z-[1000]' }}
                              >
                                <Info className="h-4 w-4" />
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              style={{ width: '100%', height: '100%' }}
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <EligibilityQuestionsForm
                  questions={eligibility}
                  control={form.control}
                  listingId={id ?? null}
                  sponsorId={listing.sponsorId ?? null}
                  editFetched={editFetched}
                  compensationType={compensationType ?? null}
                  token={token ?? null}
                  listingType={type ?? null}
                  isGodMode={isGodMode}
                  onClose={handleClose}
                />
                <div className="flex w-full flex-col">
                  {user?.private && !editMode && (
                    <div className="mb-4">
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertDescription className="text-yellow-800">
                          <strong>Privacy Notice:</strong> Your full profile,
                          including all details that are normally hidden from
                          public view, will be shared with the sponsor of this
                          listing when you submit your application.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  {isHackathon && !editMode && (
                    <div className="mb-4 flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        className="mt-1 data-[state=checked]:border-brand-green data-[state=checked]:bg-brand-green"
                        checked={termsAccepted}
                        onCheckedChange={(checked) =>
                          setTermsAccepted(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm leading-none text-slate-600"
                      >
                        I confirm that I have reviewed the scope of this track
                        and that my submission adheres to the specified
                        requirements. Submitting a project that does not meet
                        the submission requirements, including potential spam,
                        may result in restrictions on future submissions.
                      </label>
                    </div>
                  )}

                  <AuthWrapper
                    showCompleteProfileModal
                    completeProfileModalBodyText={
                      'Please complete your profile before submitting to a listing.'
                    }
                  >
                    <Button
                      className="ph-no-capture h-12 w-full"
                      disabled={
                        isTemplate ||
                        (!listing.isPublished && !!query['preview']) ||
                        (isHackathon && !editMode && !termsAccepted)
                      }
                      type="submit"
                    >
                      {isLoading ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Submitting...
                        </>
                      ) : isProject ? (
                        'Apply'
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </AuthWrapper>
                  {!showSelectionView && submissions && (
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => setShowSelectionView(true)}
                    >
                      Back
                    </Button>
                  )}
                  <p className="mt-2 text-center text-xs text-slate-400 sm:text-sm">
                    By submitting/applying to this listing, you agree to our{' '}
                    <button
                      onClick={() => setIsTOSModalOpen(true)}
                      className="cursor-pointer underline underline-offset-2"
                      rel="noopener noreferrer"
                    >
                      Terms of Use
                    </button>
                    .
                  </p>
                </div>
              </div>
            </form>
          </Form>
        )}
        {listing?.sponsor?.name && (
          <SubmissionTerms
            entityName={listing.sponsor.entityName}
            isOpen={isTOSModalOpen}
            onClose={() => setIsTOSModalOpen(false)}
            sponsorName={listing.sponsor.name}
          />
        )}
      </SideDrawerContent>
    </SideDrawer>
  );
};
