import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Prisma } from '@prisma/client';
import { Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { tokenList } from '@/constants/tokenList';
import { type MilestoneWithUser } from '@/interface/submission';

import { PaymentMode } from '../constants';
import { useCreateMilestones } from '../mutations/useCreateMilestones';
import { MilestoneCard } from './MilestoneCard';
import { PaymentSetupDialogFooter } from './PaymentSetupDialogFooter';
import { ProjectAmountPanel } from './ProjectAmountPanel';

interface PaymentSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectAmount: number;
  tokenSymbol: string;
  submissionId: string;
  onSave?: (milestones: MilestoneWithUser[]) => void;
}

type MilestonePayloadItem = Prisma.MilestoneCreateManyInput & { id: string };

const milestoneItemSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().optional().nullable(),
  deadline: z.date(),
  reward: z.number().min(0, 'Amount must be greater than or equal to 0'),
  milestoneIndex: z.number().int().positive(),
  token: z.string(),
});

const paymentSetupFormSchema = z.object({
  mode: z.nativeEnum(PaymentMode),
  milestones: z.array(milestoneItemSchema),
});

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
  const createMilestonesMutation = useCreateMilestones();

  const form = useForm<PaymentSetupForm>({
    resolver: zodResolver(paymentSetupFormSchema),
    mode: 'onChange',
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
  const { fields, append, remove, insert, move } = useFieldArray({
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.key === active.id);
      const newIndex = fields.findIndex((f) => f.key === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        fields.forEach((_, index) => {
          form.setValue(`milestones.${index}.milestoneIndex`, index + 1);
        });
      }
    }
  };

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

  const handleSave = async (values: PaymentSetupForm) => {
    if (values.mode === PaymentMode.MILESTONE) {
      if (!values.milestones?.length) {
        return;
      }
      if (currentAmount !== projectAmount) {
        form.setError('milestones', {
          type: 'manual',
          message: 'The total of all milestones must match the project amount',
        });
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
              ? new Date(
                  new Date(m.deadline).setHours(23, 59, 0, 0),
                ).toISOString()
              : undefined,
            reward: Number(m.reward || 0),
            milestoneIndex: idx + 1,
          })),
        };

    createMilestonesMutation.mutate(body, {
      onSuccess: (data) => {
        onSave?.(data.milestones);
        onOpenChange(false);
      },
    });
  };

  const duplicateMilestoneAt = (index: number) => {
    const values = form.getValues();
    insert(index + 1, {
      id: String(fields.length + 1),
      submissionId: submissionId,
      title: values.milestones[index]?.title || '',
      description: values.milestones[index]?.description || '',
      reward: Number(values.milestones[index]?.reward || 0),
      deadline: values.milestones[index]?.deadline,
      milestoneIndex: fields.length + 1,
      token: tokenSymbol,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseIcon={false}
        side="right"
        className="flex h-[100vh] flex-col p-0 sm:max-w-xl"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="flex h-[100vh] flex-col"
          >
            <div className="flex h-full flex-col gap-6 overflow-y-auto p-6 pb-0">
              <SheetHeader className="shrink-0">
                <SheetTitle>Payment Setup</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                <ProjectAmountPanel
                  projectAmount={projectAmount}
                  tokenSymbol={tokenSymbol}
                  tokenIconSrc={tokenIconSrc}
                />

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('milestones', []);
                        }}
                        className="mt-2 space-y-5"
                      >
                        <PaymentOption
                          id="pay-full"
                          value={PaymentMode.FULL}
                          title="Pay for whole project"
                          description="Make a one-time payment for the whole project — either at the start or after the work is completed."
                        />
                        <PaymentOption
                          id="pay-ms"
                          value={PaymentMode.MILESTONE}
                          title="Pay by milestones"
                          description="Split payment into milestones"
                        />
                      </RadioGroup>
                    )}
                  />

                  {mode === PaymentMode.MILESTONE && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={fields.map((f) => f.key)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {fields.map((field, index) => (
                            <MilestoneCard
                              id={field.key}
                              key={field.key}
                              index={index}
                              tokenSymbol={tokenSymbol}
                              onDelete={() => remove(index)}
                              onDuplicate={() => duplicateMilestoneAt(index)}
                              hideDeleteButton={fields.length === 1}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay>
                        {activeId ? (
                          <div className="w-full rounded-md bg-white opacity-80 shadow-lg">
                            {fields.map((field, index) =>
                              field.key === activeId ? (
                                <MilestoneCard
                                  id={field.key}
                                  key={field.key}
                                  index={index}
                                  tokenSymbol={tokenSymbol}
                                  onDelete={() => remove(index)}
                                  onDuplicate={() =>
                                    duplicateMilestoneAt(index)
                                  }
                                  hideDeleteButton={fields.length === 1}
                                />
                              ) : null,
                            )}
                          </div>
                        ) : null}
                      </DragOverlay>
                      <div className="mr-7 mt-4 flex justify-end">
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
                    </DndContext>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t">
              <PaymentSetupDialogFooter
                totalAmount={projectAmount}
                currentAmount={currentAmount}
                tokenSymbol={tokenSymbol}
                tokenIconSrc={tokenIconSrc}
                paymentMode={mode}
                isSubmitting={createMilestonesMutation.isPending}
                errors={form.formState.errors}
              />
            </div>
          </form>
        </Form>
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
