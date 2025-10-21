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
import { Plus } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { tokenList } from '@/constants/tokenList';

import { MilestoneCard } from '@/features/listing-payment-setup/components/MilestoneCard';
import { PaymentSetupDialogFooter } from '@/features/listing-payment-setup/components/PaymentSetupDialogFooter';
import { ProjectAmountPanel } from '@/features/listing-payment-setup/components/ProjectAmountPanel';
import { PaymentMode } from '@/features/listing-payment-setup/constants';
import { type Listing } from '@/features/listings/types';

import {
  type MilestoneEditData,
  useEditMilestones,
} from '../../mutations/useEditMilestones';
import { type SubmissionWithListingUser } from '../../queries/dashboard-submissions';

interface EditMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionWithListingUser;
  listing: Listing;
  onSuccess?: () => void;
}

type MilestoneFormItem = MilestoneEditData & {
  id: string;
  submissionId: string;
  token: string;
  isLocked?: boolean;
};

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
  isLocked: z.boolean().optional(),
});

const editMilestonesFormSchema = z.object({
  milestones: z.array(milestoneItemSchema),
});

interface EditMilestonesForm {
  milestones: MilestoneFormItem[];
}

export function EditMilestoneDialog({
  open,
  onOpenChange,
  submission,
  listing,
  onSuccess,
}: EditMilestoneDialogProps) {
  const editMilestonesMutation = useEditMilestones();

  const projectAmount = useMemo(() => {
    if (!submission.winnerPosition || !listing.rewards) return 0;
    return listing.rewards[submission.winnerPosition] || 0;
  }, [submission, listing]);

  const tokenSymbol =
    listing.token === 'Any' ? submission.token! : listing.token!;

  const initialMilestones = useMemo(() => {
    return submission.Milestones.map((milestone) => ({
      id: milestone.id,
      submissionId: submission.id,
      title: milestone.title,
      description: milestone.description || '',
      reward: milestone.reward,
      deadline: milestone.deadline ? new Date(milestone.deadline) : undefined,
      milestoneIndex: milestone.milestoneIndex,
      token: milestone.token,
      isLocked: ['Approved', 'Paid'].includes(milestone.status),
    }));
  }, [submission]);

  const form = useForm<EditMilestonesForm>({
    resolver: zodResolver(editMilestonesFormSchema),
    mode: 'onChange',
    defaultValues: {
      milestones: initialMilestones as MilestoneFormItem[],
    },
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      form.reset({
        milestones: initialMilestones as MilestoneFormItem[],
      });
    }
  }, [open, initialMilestones, form]);

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
    return (milestones as MilestoneFormItem[]).reduce(
      (acc, m) => acc + (Number(m.reward) || 0),
      0,
    );
  }, [milestones]);

  const lockedAmount = useMemo(() => {
    return (milestones as MilestoneFormItem[])
      .filter((m) => m.isLocked)
      .reduce((acc, m) => acc + (Number(m.reward) || 0), 0);
  }, [milestones]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    const draggedField = fields.find((f) => f.key === draggedId);
    if (!draggedField?.isLocked) {
      setActiveId(draggedId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.key === active.id);
      const newIndex = fields.findIndex((f) => f.key === over.id);

      if (
        oldIndex !== -1 &&
        newIndex !== -1 &&
        !fields[oldIndex]?.isLocked &&
        !fields[newIndex]?.isLocked
      ) {
        move(oldIndex, newIndex);
        fields.forEach((_, index) => {
          form.setValue(`milestones.${index}.milestoneIndex`, index + 1);
        });
      }
    }
  };

  const handleAddMilestone = () => {
    const nextId = `new-${Date.now()}`;
    const nextMilestoneNumber = fields.length + 1;
    append({
      id: nextId,
      submissionId: submission.id,
      title: `Milestone ${nextMilestoneNumber}`,
      description: '',
      reward: 0,
      deadline: undefined,
      milestoneIndex: nextMilestoneNumber,
      token: tokenSymbol,
      isLocked: false,
    });
  };

  const handleSave = async (values: EditMilestonesForm) => {
    if (currentAmount !== projectAmount) {
      form.setError('milestones', {
        type: 'manual',
        message: 'The total of all milestones must match the project amount',
      });
      return;
    }

    // Filter out locked milestones and prepare payload
    const editableMilestones = values.milestones
      .filter((m) => !m.isLocked)
      .map((m) => ({
        title: m.title,
        description: m.description || '',
        deadline: m.deadline
          ? new Date(new Date(m.deadline).setHours(23, 59, 0, 0)).toISOString()
          : undefined,
        reward: Number(m.reward || 0),
        milestoneIndex: m.milestoneIndex,
      }));

    editMilestonesMutation.mutate(
      {
        submissionId: submission.id,
        milestones: editableMilestones,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onOpenChange(false);
        },
      },
    );
  };

  const duplicateMilestoneAt = (index: number) => {
    const values = form.getValues();
    const sourceMilestone = values.milestones[index];
    if (!sourceMilestone?.isLocked) {
      insert(index + 1, {
        id: `new-${Date.now()}`,
        submissionId: submission.id,
        title: sourceMilestone?.title || '',
        description: sourceMilestone?.description,
        reward: Number(sourceMilestone?.reward || 0),
        deadline: sourceMilestone?.deadline,
        milestoneIndex: fields.length + 1,
        token: tokenSymbol,
        isLocked: false,
      });
    }
  };

  const editableMilestones = fields.filter((f) => !f.isLocked);

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
                <SheetTitle>Edit Milestones</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                <ProjectAmountPanel
                  projectAmount={projectAmount}
                  tokenSymbol={tokenSymbol}
                  tokenIconSrc={tokenIconSrc}
                />

                {lockedAmount > 0 && (
                  <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                    <p className="font-medium">
                      {tokenSymbol} {lockedAmount.toLocaleString('en-us')} is
                      locked in approved/paid milestones
                    </p>
                    <p className="mt-1 text-xs">
                      You can only edit milestones that haven&apos;t been
                      approved yet.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields
                        .filter((f) => !f.isLocked)
                        .map((f) => f.key)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div
                            key={field.key}
                            className={field.isLocked ? 'opacity-60' : ''}
                          >
                            {field.isLocked && (
                              <div className="mb-2 text-xs text-slate-500">
                                This milestone is{' '}
                                {submission.Milestones[index]?.status} and
                                cannot be edited
                              </div>
                            )}
                            <MilestoneCard
                              id={field.key}
                              index={index}
                              tokenSymbol={tokenSymbol}
                              onDelete={() => !field.isLocked && remove(index)}
                              onDuplicate={() => duplicateMilestoneAt(index)}
                              hideDeleteButton={
                                editableMilestones.length === 1 ||
                                field.isLocked
                              }
                              disabled={field.isLocked}
                            />
                          </div>
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
                                onDuplicate={() => duplicateMilestoneAt(index)}
                                hideDeleteButton={
                                  editableMilestones.length === 1
                                }
                              />
                            ) : null,
                          )}
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

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
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t">
              <PaymentSetupDialogFooter
                totalAmount={projectAmount}
                currentAmount={currentAmount}
                tokenSymbol={tokenSymbol}
                tokenIconSrc={tokenIconSrc}
                paymentMode={PaymentMode.MILESTONE}
                isSubmitting={editMilestonesMutation.isPending}
                errors={form.formState.errors}
              />
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
