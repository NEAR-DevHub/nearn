import { CircleHelp, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const steps = [
  {
    step: 'Distribute prizes',
    description: 'Select one or more contributors and assign every prize',
    custom: (
      <div className="mt-1 flex items-center gap-[10px] rounded-md bg-sky-50 p-3">
        <Info className="h-4 w-4 shrink-0 text-sky-700" />
        <p className="text-sm text-sky-700">
          Allocate the whole prize pool or edit the listing to shrink it before
          you can continue
        </p>
      </div>
    ),
  },
  {
    step: 'Announce winners',
    description:
      'Announce winners makes the results public and sends a notification to each winner',
    custom: null,
  },
  {
    step: 'Lock submissions',
    description:
      'The listing closes automatically when winners are published (or is already closed if the deadline passed)',
    custom: null,
  },
  {
    step: 'Confirm the payout',
    description:
      'Click Verify payments, then add a NearBlocks transaction link for every winner. Each submission flips to Paid as soon as its link is verified.',
    custom: null,
  },
] as const;

export const SelectWinnersGuide = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-4 w-4 bg-none">
            <CircleHelp className="h-4 w-4 text-slate-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Select Winners Guide</DialogTitle>
          </DialogHeader>
          <DialogDescription className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-1">
                <p className="text-sm text-slate-600">{index + 1}.</p>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-slate-600">{step.step}</p>
                  <p className="text-sm text-slate-500">{step.description}</p>
                  {step.custom && step.custom}
                </div>
              </div>
            ))}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};
