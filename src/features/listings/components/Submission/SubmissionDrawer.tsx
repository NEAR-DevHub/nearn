import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';
import { usePostHog } from 'posthog-js/react';
import { type JSX, useEffect, useState } from 'react';
import { useForm, type UseFormReturn, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { EligibilityQuestions } from '@/components/eligibility/EligibilityQuestions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { KycComponent } from '@/components/ui/KycComponent';
import { SideDrawer, SideDrawerContent } from '@/components/ui/side-drawer';
import { CHAIN_NAME } from '@/constants/project';
import { tokenList } from '@/constants/tokenList';
import { type SubmissionWithUser } from '@/interface/submission';
import { api } from '@/lib/api';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { AuthWrapper } from '@/features/auth/components/AuthWrapper';

import { submissionCountQuery } from '../../queries/submission-count';
import { listingSubmissionsQuery } from '../../queries/submissions';
import { userSubmissionQuery } from '../../queries/user-submission-status';
import { type Listing } from '../../types';
import { submissionSchema } from '../../utils/submissionFormSchema';
import { SubmissionTerms } from './SubmissionTerms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  listing: Listing;
  submission: SubmissionWithUser | undefined;
  isTemplate?: boolean;
  showEasterEgg: () => void;
  onSurveyOpen: () => void;
  isGodMode?: boolean;
}

type FormData = z.infer<ReturnType<typeof submissionSchema>>;

export const SubmissionDrawer = ({
  isOpen,
  onClose,
  editMode,
  listing,
  submission,
  isTemplate = false,
  showEasterEgg,
  onSurveyOpen,
  isGodMode = false,
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
  const formPublicKey = useWatch({
    control: form.control,
    name: 'publicKey',
  });

  const posthog = usePostHog();
  const router = useRouter();
  const { query } = router;

  const handleClose = () => {
    form.reset({
      link: '',
      tweet: '',
      otherInfo: '',
      ask: null,
      token: token === 'Any' ? tokenList[0]?.tokenSymbol : undefined,
      eligibilityAnswers: Array.isArray(listing.eligibility)
        ? listing.eligibility.map((q) => ({
            question: q.question,
            answer: '',
          }))
        : [],
      publicKey: user?.publicKey || '',
    });
    setTermsAccepted(false);
    onClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && submission?.id) {
        try {
          const response = await api.get('/api/submission/get/', {
            params: { id: submission.id },
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
      }
    };

    fetchData();
  }, [id, editMode, form.reset]);

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
        submissionId: editMode ? submission?.id : undefined,
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

  let headerText = '';
  let subheadingText: JSX.Element | string = '';
  switch (type) {
    case 'project':
      headerText = 'Submit Your Application';
      subheadingText = (
        <>
          Don&apos;t start working just yet! Apply first, and then begin working
          only once you&apos;ve been chosen for the project by the sponsor.
          <p>
            Please note that the sponsor might contact you to assess fit before
            picking the winner.
          </p>
        </>
      );
      break;
    case 'bounty':
      headerText = 'Bounty Submission';
      subheadingText = "We can't wait to see what you've created!";
      break;
    case 'sponsorship':
      headerText = 'Sponsorship Submission';
      subheadingText = "We can't wait to see what you've created!";
      break;
    case 'hackathon':
      headerText = `${CHAIN_NAME} Radar Track Submission`;
      subheadingText = (
        <>
          Note:
          <p>
            1. In the &quot;Link to your Submission&quot; field, submit your
            hackathon project&apos;s most useful link (could be a loom video,
            GitHub link, website, etc)
          </p>
          <p>
            2. To be eligible for different challenges, you need to submit to
            each challenge separately
          </p>
          <p>
            3. {`There's no`} restriction on the number of challenges you can
            submit to
          </p>
        </>
      );
      break;
  }

  return (
    <SideDrawer open={isOpen} onClose={handleClose} className="scrollbar-none">
      <SideDrawerContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ width: '100%', height: '100%' }}
          >
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="h-full overflow-y-auto rounded-lg border border-slate-200 px-2 shadow-[0px_1px_3px_rgba(0,0,0,0.08),_0px_1px_2px_rgba(0,0,0,0.06)] md:px-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:w-1.5 [&::-webkit-scrollbar]:w-1">
                <div className="mb-4 border-b border-slate-100 bg-white py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-slate-700">
                      {isGodMode ? '[GOD MODE] ' : ''}
                      {headerText}
                    </p>
                    <X
                      className="h-4 w-4 text-slate-400"
                      onClick={handleClose}
                    />
                  </div>
                  <p className="text-sm text-slate-500">{subheadingText}</p>
                </div>
                <div>
                  <div className="mb-5 flex flex-col gap-4">
                    <EligibilityQuestions
                      questions={eligibility}
                      control={form.control}
                      listingId={id ?? null}
                      editFetched={editFetched}
                      compensationType={compensationType ?? null}
                      token={token ?? null}
                      listingType={type ?? null}
                    />

                    <FormField
                      control={form.control}
                      name="publicKey"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-2">
                          <div>
                            <FormLabel isRequired={!user?.publicKey}>
                              Your {CHAIN_NAME} Wallet Address
                            </FormLabel>
                            <FormDescription>
                              {!!user?.publicKey ? (
                                <>
                                  This is where you will receive your payment if
                                  your submission is approved. If you want to
                                  edit it,{' '}
                                  <a
                                    href={`/t/${user?.username}/edit`}
                                    className="text-blue-600 underline hover:text-blue-700"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    click here
                                  </a>
                                </>
                              ) : (
                                <>
                                  This wallet address will be linked to your
                                  profile and you will receive your rewards here
                                  if you win.
                                </>
                              )}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <div className="flex flex-col gap-2">
                              <Input
                                className={cn(
                                  !!user?.publicKey &&
                                    'cursor-not-allowed text-slate-600 opacity-80',
                                )}
                                placeholder={`Add your ${CHAIN_NAME} wallet address`}
                                readOnly={!!user?.publicKey}
                                {...(!!user?.publicKey ? {} : field)}
                                value={user?.publicKey || field.value}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <KycComponent
                      address={formPublicKey ?? user?.publicKey ?? ''}
                      listingSponsorId={listing.sponsorId}
                      variant="extended"
                    />
                  </div>
                </div>
              </div>

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
                      I confirm that I have reviewed the scope of this track and
                      that my submission adheres to the specified requirements.
                      Submitting a project that does not meet the submission
                      requirements, including potential spam, may result in
                      restrictions on future submissions.
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
