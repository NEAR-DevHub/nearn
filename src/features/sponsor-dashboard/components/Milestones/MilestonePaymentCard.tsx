import {
  ChevronDownIcon,
  MoreVertical,
  Pencil,
  TriangleAlert,
  X,
} from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/use-disclosure';
import { cn } from '@/utils/cn';

import { type Listing } from '@/features/listings/types';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

import { useCancelCollaboration } from '../../mutations/useCancelCollaboration';
import { NextSteps } from '../PublishProjectHiring';
import {
  SubmissionSocialRow,
  SubmissionTalent,
} from '../Submissions/SubmissionTalent';
import MilestoneCompletionLine from './CompletionLine';
import { EditMilestoneDialog } from './EditMilestoneDialog';
import MilestoneTable from './MilestoneTable';

interface Props {
  submission: SubmissionWithListingUser;
  bounty: Listing;
  singleSubmission?: boolean;
  isExpanded?: boolean;
}

export default function MilestonePaymentCard({
  submission,
  bounty,
  singleSubmission,
  isExpanded,
}: Props) {
  const {
    isOpen: isEditMilestoneOpen,
    onOpen: onEditMilestoneOpen,
    onClose: onEditMilestoneClose,
  } = useDisclosure();

  return (
    <>
      <Collapsible
        defaultOpen={isExpanded}
        className={cn(
          'rounded-lg border bg-white',
          singleSubmission && 'h-full min-h-fit',
        )}
      >
        <div className="flex w-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <SubmissionTalent submission={submission} bounty={bounty} />
            <div className="flex items-center gap-2">
              <MilestoneCompletionLine submission={submission} />
              <SubmissionDropdown
                submission={submission}
                onEditClick={onEditMilestoneOpen}
              />
              {!singleSubmission && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="aria-expanded:rotate-180"
                  >
                    <ChevronDownIcon className="h-4 w-4 transition-transform" />
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>
          <SubmissionSocialRow submission={submission} bounty={bounty} />
        </div>
        <CollapsibleContent>
          <MilestoneTable
            listing={bounty}
            submission={submission}
            className={cn('rounded-t-none', singleSubmission && 'rounded-none')}
          />
        </CollapsibleContent>
      </Collapsible>

      <EditMilestoneDialog
        open={isEditMilestoneOpen}
        onOpenChange={onEditMilestoneClose}
        submission={submission}
        listing={bounty}
        onSuccess={onEditMilestoneClose}
      />
    </>
  );
}

const cancelCollaborationResults = {
  title: 'After cancelling',
  steps: [
    {
      icon: X,
      title:
        'All milestone actions will be locked (editing, approvals, payments).',
    },
    {
      icon: TriangleAlert,
      title: 'This action is irreversible.',
    },
  ],
};

interface DropdownProps {
  submission: SubmissionWithListingUser;
  onEditClick: () => void;
}

function SubmissionDropdown({ submission, onEditClick }: DropdownProps) {
  const cancelCollaboration = useCancelCollaboration();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reason, setReason] = useState('');

  const handleCancelCollaboration = () => {
    cancelCollaboration.mutate(
      {
        submissionId: submission.id,
        reason,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-slate-500"
            onClick={onEditClick}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Milestones
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
            onClick={onOpen}
            disabled={cancelCollaboration.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            {cancelCollaboration.isPending
              ? 'Cancelling...'
              : 'Cancel Collaboration'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Cancel Collaboration</DialogTitle>
            <DialogDescription>
              This will end your work with the selected talent.
            </DialogDescription>
          </DialogHeader>
          <NextSteps nextSteps={cancelCollaborationResults} />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-600">
              Reason for cancellation
            </p>
            <Textarea
              placeholder="Explain the reason for cancellation so the talent can understand."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[150px]"
            />
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
              onClick={() => {
                posthog.capture('cancel_collaboration');
                handleCancelCollaboration();
              }}
            >
              {cancelCollaboration.isPending ? (
                <>
                  <span className="loading loading-spinner" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
