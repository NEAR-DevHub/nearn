import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Info, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import { TokenNumberInput } from '@/features/listing-builder/components/Form/Rewards/Tokens/TokenNumberInput';

interface MilestoneCardProps {
  id: string;
  tokenSymbol: string;
  index: number;
  onDuplicate: () => void;
  onDelete: () => void;
  hideDeleteButton?: boolean;
  disabled?: boolean;
  isUsdBased: boolean;
}

export const MilestoneCard = ({
  id,
  tokenSymbol,
  index,
  onDuplicate,
  onDelete,
  hideDeleteButton = false,
  disabled = false,
  isUsdBased,
}: MilestoneCardProps) => {
  const { control } = useFormContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '100%',
    height: 'auto',
  } as const;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative pr-7',
        isDragging && 'opacity-50',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <div className="rounded-md border">
        <div className="flex items-center gap-2 border-b p-2">
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'cursor-grab active:cursor-grabbing',
              disabled && 'cursor-not-allowed',
            )}
          >
            <GripVertical className="h-4 w-4 text-slate-400" />
          </div>
          <FormField
            control={control}
            name={`milestones.${index}.title`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Milestone Title"
                    borderless
                    className="h-fit rounded-none p-0 text-sm font-medium text-slate-700"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full border-b p-3">
          <FormField
            control={control}
            name={`milestones.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Milestone Description"
                    className="h-fit p-0"
                    borderless
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
          <div className="w-full">
            <div className="flex items-center gap-1">
              <Label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due Date
              </Label>
              <Tooltip
                content="The date by which the work for this milestone should be completed."
                contentProps={{ className: 'z-[70] max-w-[220px]' }}
              >
                <Info className="h-4 w-4 text-slate-400" />
              </Tooltip>
            </div>
            <FormField
              control={control}
              name={`milestones.${index}.deadline`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hideTime
                      borderless
                      min={new Date()}
                      placeholder="dd.mm.yyyy"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-col sm:min-w-[180px]">
            <Label className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Amount{isUsdBased ? ' in USD' : ` in ${tokenSymbol}`}
            </Label>
            <FormField
              control={control}
              name={`milestones.${index}.reward`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TokenNumberInput
                      symbol={tokenSymbol}
                      value={field.value}
                      onChange={field.onChange}
                      borderless
                      noTokenText
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!hideDeleteButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-1"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-slate-500" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-1"
          type="button"
          onClick={onDuplicate}
        >
          <Copy className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </div>
  );
};
