import { Copy, GripVertical, Info, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';

import { TokenNumberInput } from '@/features/listing-builder/components/Form/Rewards/Tokens/TokenNumberInput';

interface MilestoneCardProps {
  tokenSymbol: string;
  amount: number | null;
  onAmountChange: (amount: number | null) => void;
  milestoneName?: string;
  onMilestoneNameChange?: (name: string) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function MilestoneCard({
  tokenSymbol,
  amount,
  onAmountChange,
  milestoneName = '',
  onMilestoneNameChange,
  onDuplicate,
  onDelete,
}: MilestoneCardProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  return (
    <div className="group relative pr-7">
      <div className="rounded-md border p-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-400" />
          <div className="text-sm font-medium text-slate-700">Milestone 1</div>
        </div>

        <Separator className="mb-2 mt-3" />

        <div className="w-full">
          <Input
            placeholder="Milestone Description"
            borderless
            value={milestoneName}
            onChange={(e) => onMilestoneNameChange?.(e.target.value)}
          />
        </div>

        <Separator className="mb-3 mt-2" />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="w-full">
            <div className="flex items-center gap-1">
              <Label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Due Date
              </Label>
              <Tooltip
                content="The date by which the work for this milestone should be completed."
                contentProps={{ className: 'z-[70] max-w-[220px]' }}
              >
                <Info className="h-3 w-3 text-slate-400" />
              </Tooltip>
            </div>
            <DateTimePicker
              value={dueDate}
              onChange={setDueDate}
              hideTime
              borderless
              placeholder="dd.mm.yyyy"
            />
          </div>
          <div className="flex w-full flex-col sm:min-w-[180px]">
            <Label className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Amount
            </Label>
            <TokenNumberInput
              symbol={tokenSymbol}
              value={amount}
              onChange={onAmountChange}
              borderless
              noTokenText
            />
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-1"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-slate-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-1"
          onClick={onDuplicate}
        >
          <Copy className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </div>
  );
}
