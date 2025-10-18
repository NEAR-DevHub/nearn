import type { Prisma } from '@prisma/client';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
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
  projectAmount: number;
  tokenSymbol: string;
  submissionId: string;
  onSave?: (mode: PaymentMode) => void;
}

type MilestonePayloadItem = Prisma.MilestoneCreateManyInput & { id: string };

interface PaymentSetupForm {
  mode: PaymentMode;
  milestones: MilestonePayloadItem[];
}

export function PaymentSetupDialog({
  open,
  onOpenChange,
  projectAmount,
  tokenSymbol,
  submissionId,
  onSave,
}: PaymentSetupDialogProps) {
  const form = useForm<PaymentSetupForm>({
    defaultValues: {
      mode: PaymentMode.FULL,
      milestones: [
        {
          id: '1',
          submissionId: submissionId,
          title: 'Milestone 1',
          description: '',
          reward: 0,
          deadline: undefined,
          milestoneIndex: 1,
          token: tokenSymbol,
        },
      ],
    },
  });

  const mode = form.watch('mode');
  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'milestones',
    keyName: 'key',
  });

  const tokenIconSrc =
    tokenList.find((e) => e?.tokenSymbol === tokenSymbol)?.icon ??
    '/assets/dollar.svg';
  const milestones =
    useWatch({ control: form.control, name: 'milestones' }) ?? [];
  const currentAmount = useMemo(() => {
    return (milestones as MilestonePayloadItem[]).reduce(
      (acc, m) => acc + (Number(m.reward) || 0),
      0,
    );
  }, [milestones]);

  const handleAddMilestone = () => {
    const nextId = String(fields.length + 1);
    const nextMilestoneNumber = fields.length + 1;
    append({
      id: nextId,
      submissionId: submissionId,
      title: `Milestone ${nextMilestoneNumber}`,
      description: '',
      reward: 0,
      deadline: undefined,
      milestoneIndex: nextMilestoneNumber,
      token: tokenSymbol,
    });
  };

  const handleSave = async () => {
    const values = form.getValues();
    if (values.mode === PaymentMode.MILESTONE) {
      if (!values.milestones?.length || currentAmount !== projectAmount) {
        return;
      }
    }

    const useSingleMilestone = values.mode === PaymentMode.FULL;
    const body = useSingleMilestone
      ? { submissionId, useSingleMilestone: true }
      : {
          submissionId,
          useSingleMilestone: false,
          milestones: values.milestones.map((m, idx) => ({
            title: m.title || `Milestone ${idx + 1}`,
            description: m.description || '',
            deadline: m.deadline
              ? new Date(m.deadline).toISOString()
              : undefined,
            reward: Number(m.reward || 0),
            milestoneIndex: idx + 1,
          })),
        };

    try {
      const res = await fetch('/api/milestones/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      onSave?.(values.mode);
      onOpenChange(false);
    } catch (_) {}
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
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
                    onValueChange={(v) =>
                      form.setValue('mode', v as PaymentMode)
                    }
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
                      {fields.map((field, index) => (
                        <MilestoneCard
                          key={field.key}
                          tokenSymbol={tokenSymbol}
                          amount={
                            form.watch(
                              `milestones.${index}.reward`,
                            ) as unknown as number | null
                          }
                          onAmountChange={(val) =>
                            form.setValue(
                              `milestones.${index}.reward`,
                              Number(val || 0),
                            )
                          }
                          title={form.watch(`milestones.${index}.title`) || ''}
                          onTitleChange={(title) =>
                            form.setValue(`milestones.${index}.title`, title)
                          }
                          description={
                            form.watch(`milestones.${index}.description`) || ''
                          }
                          onDescriptionChange={(description: string) =>
                            form.setValue(
                              `milestones.${index}.description`,
                              description,
                            )
                          }
                          dueDate={
                            form.watch(
                              `milestones.${index}.deadline`,
                            ) as unknown as Date | undefined
                          }
                          onDueDateChange={(date) =>
                            form.setValue(`milestones.${index}.deadline`, date)
                          }
                          onDelete={() => remove(index)}
                          onDuplicate={() =>
                            insert(index + 1, {
                              id: String(fields.length + 1),
                              submissionId: submissionId,
                              title: `Milestone ${fields.length + 1}`,
                              description:
                                form.getValues(
                                  `milestones.${index}.description`,
                                ) || '',
                              reward: Number(
                                form.getValues(`milestones.${index}.reward`) ||
                                  0,
                              ),
                              deadline: form.getValues(
                                `milestones.${index}.deadline`,
                              ),
                              milestoneIndex: fields.length + 1,
                              token: tokenSymbol,
                            })
                          }
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
      </Form>
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
