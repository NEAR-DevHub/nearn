import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalImage } from '@/components/ui/local-image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TokenInput } from '@/components/ui/token-input';
import { tokenList } from '@/constants/tokenList';

interface PaymentSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectAmount?: number;
  tokenSymbol?: string;
  onSave: (mode: 'full' | 'milestone') => void;
}

export function PaymentSetupDialog({
  open,
  onOpenChange,
  projectAmount = 1000,
  tokenSymbol = 'USDC',
  onSave,
}: PaymentSetupDialogProps) {
  const [mode, setMode] = useState<'full' | 'milestone'>('full');
  const [amount, setAmount] = useState<number | null>(projectAmount);

  const total = useMemo(() => amount ?? 0, [amount]);

  const handleSave = () => {
    onSave(mode);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseIcon={false}
        side="right"
        className="flex h-[100vh] flex-col p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-6 p-6 pb-0">
          <SheetTitle>Payment Setup</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col p-6 pt-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600">
                Project Amount
              </Label>
              <div className="flex items-center gap-2">
                <LocalImage
                  className="h-5 w-5 rounded-full"
                  alt="token"
                  src={
                    tokenList.filter((e) => e?.tokenSymbol === tokenSymbol)[0]
                      ?.icon ?? '/assets/dollar.svg'
                  }
                />
                <div className="space-x-2">
                  <span className="font-semibold text-slate-900">{amount}</span>
                  <span className="font-semibold text-slate-400">
                    {tokenSymbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <RadioGroup
                value={mode}
                onValueChange={(v) => setMode(v as 'full' | 'milestone')}
                className="mt-2 space-y-5"
              >
                <PaymentOption
                  id="pay-full"
                  value="full"
                  title="Pay for whole project"
                  description="Make the full amount"
                />
                <PaymentOption
                  id="pay-ms"
                  value="milestone"
                  title="Pay by milestones"
                  description="Split payment into milestones"
                />
              </RadioGroup>
            </div>

            {mode === 'milestone' && (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-full">
                    <Label className="text-sm text-slate-500">
                      Milestone name
                    </Label>
                    <Input placeholder="Define milestone" className="mt-1" />
                  </div>
                  <div className="min-w-[180px]">
                    <Label className="text-sm text-slate-500">Amount</Label>
                    <TokenInput
                      token={tokenSymbol}
                      value={amount}
                      onChange={setAmount}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <Separator />
          <SheetFooter className="p-6">
            <div className="flex w-full flex-col items-center space-y-6">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  Total Prize
                </span>
                <div className="flex items-center gap-2">
                  <LocalImage
                    className="h-5 w-5 rounded-full"
                    alt="token"
                    src={
                      tokenList.filter((e) => e?.tokenSymbol === tokenSymbol)[0]
                        ?.icon ?? '/assets/dollar.svg'
                    }
                  />
                  <span className="font-semibold text-slate-900">
                    {total} {tokenSymbol}
                  </span>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>
                Save
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface PaymentOptionProps {
  id: string;
  value: 'full' | 'milestone';
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
