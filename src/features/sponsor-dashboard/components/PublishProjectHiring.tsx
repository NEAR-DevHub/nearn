import { useAtomValue } from 'jotai';
import {
  AlertTriangle,
  Check,
  CircleCheckBig,
  CircleDollarSign,
  type LucideIcon,
  MessagesSquare,
  X,
} from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { type Dispatch, type SetStateAction, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';

import { type Listing } from '../../listings/types';
import { selectedSubmissionAtom } from '../atoms';
import { useToggleWinner } from '../mutations/useToggleWinner';
import { type SubmissionWithListingUser } from '../queries/dashboard-submissions';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  totalWinners: number;
  totalPaymentsMade: number;
  bounty: Listing | undefined;
  remainings: { podiums: number; bonus: number } | null;
  submissions: SubmissionWithListingUser[];
  usedPositions: number[];
  setRemainings: Dispatch<
    SetStateAction<{ podiums: number; bonus: number } | null>
  >;
}

interface NextStep {
  title: string;
  steps: {
    icon: LucideIcon;
    title: string;
  }[];
}

const initialModalNextSteps: NextStep = {
  title: 'What happens next?',
  steps: [
    {
      icon: Check,
      title:
        'The listing will stay active, and the selected talent can start working on the project.',
    },
    {
      icon: X,
      title: 'All other submissions will be automatically rejected.',
    },
  ],
};

const successModalNextSteps: NextStep = {
  title: 'Next Steps',
  steps: [
    {
      icon: MessagesSquare,
      title: 'Discuss project details and deadlines.',
    },
    {
      icon: CircleDollarSign,
      title: 'Set up payment terms and milestones.',
    },
    {
      icon: CircleCheckBig,
      title: 'Track progress and mark completed when done.',
    },
  ],
};

export const NextSteps = ({ nextSteps }: { nextSteps: NextStep }) => {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold text-slate-600">{nextSteps.title}</h3>
      <div className="flex flex-col gap-0">
        {nextSteps.steps.map((step) => (
          <div className="flex items-start gap-2 p-2 pl-0" key={step.title}>
            <step.icon className="size-4 shrink-0 text-slate-500" />
            <span className="text-sm text-slate-500">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function PublishProjectHiring({
  isOpen,
  onClose,
  bounty,
  submissions,
  setRemainings,
  usedPositions,
}: Props) {
  const [isPublishingResults, setIsPublishingResults] = useState(false);
  const [isHireSuccess, setIsHireSuccess] = useState(false);
  const posthog = usePostHog();

  const selectedSubmission = useAtomValue(selectedSubmissionAtom);
  const { mutateAsync: toggleWinner } = useToggleWinner(
    bounty,
    submissions,
    setRemainings,
    usedPositions,
  );

  const handleClose = () => {
    if (!isHireSuccess || bounty?.isWinnersAnnounced) return onClose();
    const timer = setTimeout(() => {
      window.location.reload();
    }, 1500);

    return () => clearTimeout(timer);
  };

  const handleHireTalent = async () => {
    if (!bounty?.id || !selectedSubmission?.id) return;
    setIsPublishingResults(true);
    try {
      await toggleWinner({
        winnerPosition: 1,
        id: selectedSubmission?.id,
        isWinner: true,
      });
      await api.post(`/api/listings/announce/${bounty?.id}/`);
      setIsHireSuccess(true);
      setIsPublishingResults(false);
    } catch (e) {
      // Rollback on error
      if (selectedSubmission?.id) {
        await toggleWinner({
          winnerPosition: null,
          id: selectedSubmission?.id,
          isWinner: false,
        });
      }
      setIsPublishingResults(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isHireSuccess ? (
        <DialogContent className="p-0" hideCloseIcon>
          <div className="flex h-40 items-center justify-center bg-emerald-50">
            <div className="rounded-full bg-emerald-600 p-3">
              <Check className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
          </div>
          <div className="p-6">
            <DialogTitle className="font-bold">
              Talent Hired Successfully
            </DialogTitle>
            <DialogDescription className="mt-2">
              You&apos;ve successfully hired the selected talent. The project is
              now marked as &quot;Work in Progress&quot;, and you can start
              collaborating.
            </DialogDescription>
            <div className="mb-4 mt-4">
              <NextSteps nextSteps={successModalNextSteps} />
            </div>
            <Button className="w-full" onClick={handleClose}>
              Back to Project Details
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Hire Talent for Project</DialogTitle>
            <DialogDescription>
              You are about to select this talent as the winner for your project
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <NextSteps nextSteps={initialModalNextSteps} />

            <div className="flex items-center gap-2.5 rounded-lg border-none bg-amber-50 p-3">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-600">
                This action is irreversible. Please confirm your choice
                <br /> carefully - only one talent can be selected.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="text-slate-600"
            >
              Cancel
            </Button>
            <Button
              className="ph-no-capture"
              disabled={!selectedSubmission?.id}
              onClick={() => {
                posthog.capture('hire_talent_project_sponsor');
                handleHireTalent();
              }}
            >
              {isPublishingResults ? (
                <>
                  <span className="loading loading-spinner" />
                  Hiring...
                </>
              ) : (
                'Hire & Start Work'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
