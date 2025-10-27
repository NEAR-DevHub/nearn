import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronDownIcon,
  MoreVertical,
  Pencil,
  TriangleAlert,
  X,
} from 'lucide-react';
import posthog from 'posthog-js';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

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
import { Form } from '@/components/ui/form';
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/use-disclosure';
import { cn } from '@/utils/cn';

import { rejectSchema } from '@/features/listing-payment-setup/schemas/milestone.schema';
import { sponsorshipSubmissionStatus } from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { type Listing } from '@/features/listings/types';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

import { useCancelCollaboration } from '../../mutations/useCancelCollaboration';
import { colorMap } from '../../utils/statusColorMap';
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

  const status = sponsorshipSubmissionStatus(submission);
  const statusStyle = colorMap[status];

  return (
    <>
      <Collapsible
        defaultOpen={isExpanded || singleSubmission}
        className={cn(
          'rounded-lg border bg-white',
          singleSubmission && 'h-full min-h-fit',
        )}
      >
        <div className="flex w-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <SubmissionTalent submission={submission} bounty={bounty} />
              <p
                className={cn(
                  'inline-flex h-6 items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
                  statusStyle?.color,
                  statusStyle?.bg,
                )}
              >
                {status.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
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
  const form = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    mode: 'onChange',
    defaultValues: {
      submissionId: submission.id,
      reason: '',
    },
  });

  const cancelCollaboration = useCancelCollaboration();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const allMilestonesFinalized = submission.Milestones.every(
    (milestone) =>
      milestone.status === 'Paid' ||
      milestone.status === 'Cancelled' ||
      milestone.status === 'Approved',
  );

  const handleCancelCollaboration = (data: z.infer<typeof rejectSchema>) => {
    cancelCollaboration.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const clickCancelCollaboration = () => {
    posthog.capture('cancel_collaboration_sponsor');
    onOpen();
  };

  const isAnyApproved = submission.Milestones.some(
    (milestone) => milestone.status === 'Approved',
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={allMilestonesFinalized}>
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
            onClick={clickCancelCollaboration}
            disabled={cancelCollaboration.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            {cancelCollaboration.isPending
              ? 'Cancelling...'
              : 'Cancel Collaboration'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isAnyApproved ? (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent hideCloseIcon>
            <DialogTitle>Warning: Approved Milestones Not Paid</DialogTitle>
            <DialogDescription className="text-sm">
              You cannot cancel this submission because not all approved
              milestones have been paid.
            </DialogDescription>
            <DialogDescription>
              To cancel this collaboration, you must first provide payment for
              all approved milestones.
            </DialogDescription>
            <DialogFooter>
              <Button variant="default" onClick={onClose}>
                Back and Complete Payments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <Form {...form}>
            <DialogContent>
              <form
                onSubmit={form.handleSubmit(handleCancelCollaboration)}
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <DialogTitle>Cancel Collaboration</DialogTitle>
                  <DialogDescription>
                    This will end your work with the selected talent.
                  </DialogDescription>
                </DialogHeader>
                <NextSteps nextSteps={cancelCollaborationResults} />
                <div className="flex flex-col gap-2">
                  <FormFieldWrapper
                    control={form.control}
                    name="reason"
                    isRequired
                    label="Reason for cancellation"
                  >
                    <Textarea
                      placeholder="Explain the reason for cancellation so the talent can understand."
                      className="min-h-[150px]"
                    />
                  </FormFieldWrapper>
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
                    type="submit"
                    disabled={
                      cancelCollaboration.isPending ||
                      form.formState.isSubmitting ||
                      !form.formState.isValid
                    }
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
              </form>
            </DialogContent>
          </Form>
        </Dialog>
      )}
    </>
  );
}
