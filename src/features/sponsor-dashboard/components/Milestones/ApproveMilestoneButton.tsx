import { AlertTriangle, Check } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import { useApproveMilestone } from '../../mutations/useApproveMilestone';

interface Props {
  milestoneId: string;
  className?: string;
}

export default function ApproveMilestoneButton({
  milestoneId,
  className,
}: Props) {
  const [isOpen, setOpen] = useState(false);
  const approveMilestone = useApproveMilestone();

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <Tooltip content="Approve this milestone to mark it as completed" asChild>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className={cn('ph-no-capture min-w-[120px]', className)}
            disabled={approveMilestone.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            {approveMilestone.isPending ? 'Approving...' : 'Approve Milestone'}
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Milestone</DialogTitle>
        </DialogHeader>

        <Alert variant="default" className="flex border-amber-500 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="-mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <AlertTitle className="text-base">Milestone approval!</AlertTitle>
              <AlertDescription>
                Once you approve this milestone, the action is irreversible. The
                talent will be notified and can start work on the next
                milestone. After approval, you’ll need to add the payment for
                this milestone.
              </AlertDescription>
            </div>
          </div>
        </Alert>
        <DialogFooter className="flex gap-4">
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            className="text-slate-600"
          >
            Close
          </Button>
          <Button
            className="ph-no-capture"
            onClick={() => {
              posthog.capture('approve_milestone_sponsor');
              approveMilestone.mutate(milestoneId);
              setOpen(false);
            }}
          >
            {approveMilestone.isPending ? (
              <>
                <span className="loading loading-spinner" />
                Approving...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
