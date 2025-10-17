import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { tokenList } from '@/constants/tokenList';

import { PaymentMode } from '../constants';
import { MilestoneCard } from './MilestoneCard';
import { PaymentSetupDialogFooter } from './PaymentSetupDialogFooter';
import { ProjectAmountPanel } from './ProjectAmountPanel';

interface PaymentSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectAmount?: number;
  tokenSymbol?: string;
  onSave: (mode: PaymentMode) => void;
}

export function PaymentSetupDialog({
  open,
  onOpenChange,
  projectAmount = 1000,
  tokenSymbol = 'USDC',
  onSave,
}: PaymentSetupDialogProps) {
  const [mode, setMode] = useState<PaymentMode>(PaymentMode.FULL);
  const [milestones, setMilestones] = useState([
    {
      id: '1',
      name: '',
      amount: null,
      dueDate: undefined,
    },
  ]);

  const tokenIconSrc =
    tokenList.find((e) => e?.tokenSymbol === tokenSymbol)?.icon ??
    '/assets/dollar.svg';
  const currentAmount = milestones.reduce(
    (acc, milestone) => acc + (milestone.amount ?? 0),
    0,
  );

  const handleAmountChange = (amount: number | null) => {
    console.log('amount', amount);
  };

  const handleAddMilestone = () => {
    const newMilestone = {
      id: (milestones.length + 1).toString(),
      name: '',
      amount: null,
      dueDate: undefined,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleSave = () => {
    onSave(mode);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseIcon={false}
        side="right"
        className="flex h-[100vh] flex-col gap-0 p-0 sm:max-w-xl"
      >
        <div className="h-full overflow-y-auto">
          <SheetHeader className="shrink-0 space-y-6 p-6 pb-0">
            <SheetTitle>Payment Setup</SheetTitle>
          </SheetHeader>

          <div className="p-6 pt-2">
            <div className="space-y-6">
              <ProjectAmountPanel
                projectAmount={projectAmount}
                tokenSymbol={tokenSymbol}
                tokenIconSrc={tokenIconSrc}
              />

              <div className="space-y-6">
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as PaymentMode)}
                  className="mt-2 space-y-5"
                >
                  <PaymentOption
                    id="pay-full"
                    value={PaymentMode.FULL}
                    title="Pay for whole project"
                    description="Make the full amount"
                  />
                  <PaymentOption
                    id="pay-ms"
                    value={PaymentMode.MILESTONE}
                    title="Pay by milestones"
                    description="Split payment into milestones"
                  />
                </RadioGroup>
              </div>

              {mode === PaymentMode.MILESTONE && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <MilestoneCard
                        key={milestone.id}
                        tokenSymbol={tokenSymbol}
                        amount={milestone.amount}
                        onAmountChange={handleAmountChange}
                        milestoneName={milestone.name}
                        onMilestoneNameChange={(name) => {
                          const updatedMilestones = [...milestones];
                          updatedMilestones[index] = { ...milestone, name };
                          setMilestones(updatedMilestones);
                        }}
                      />
                    ))}
                  </div>
                  <div className="mr-7 flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="flex w-fit px-0"
                      onClick={handleAddMilestone}
                    >
                      <Plus /> Add Milestone
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <PaymentSetupDialogFooter
            totalAmount={projectAmount}
            currentAmount={currentAmount}
            tokenSymbol={tokenSymbol}
            tokenIconSrc={tokenIconSrc}
            paymentMode={mode}
            onSave={handleSave}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface PaymentOptionProps {
  id: string;
  value: PaymentMode;
  title: string;
  description: string;
}

const PaymentOption = ({
  id,
  value,
  title,
  description,
}: PaymentOptionProps) => (
  <Label htmlFor={id} className="flex cursor-pointer items-center gap-2">
    <RadioGroupItem id={id} value={value} />
    <div>
      <div className="text-sm font-medium text-slate-900">{title}</div>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </Label>
);

export default PaymentSetupDialog;
