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
import { useAtomValue } from 'jotai';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/utils/cn';

import { hackathonsAtom, isEditingAtom } from '../../../atoms';
import { useListingForm } from '../../../hooks';
import EligibilityQuestion from './Question';
import type { QuestionType } from './Question/Type';

export function EligibilityQuestionsForm() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const form = useListingForm();
  const type = useWatch({
    control: form.control,
    name: 'type',
  });
  const hackathonId = useWatch({
    name: 'hackathonId',
    control: form.control,
  });
  const hackathons = useAtomValue(hackathonsAtom);
  const currentHackathon = useMemo(() => {
    return hackathons?.find((h) => h.id === hackathonId);
  }, [hackathonId, hackathons]);

  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: 'eligibility',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );
  const isEditing = useAtomValue(isEditingAtom);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      move(oldIndex, newIndex);

      // Update order for all questions
      fields.forEach((_, index) => {
        form.setValue(`eligibility.${index}.order`, index + 1);
      });
    }
  };

  const handleAddQuestion = (focus = true) => {
    append(
      {
        order: fields.length + 1,
        question: '',
        type: 'text',
        optional: false,
        variants: null,
      },
      {
        shouldFocus: focus,
      },
    );
  };

  const handleRemoveQuestion = (index: number) => {
    const questionToRemove = fields[index];
    if (!questionToRemove) return;

    const questionData = {
      question: questionToRemove.question || '',
      type: questionToRemove.type || 'text',
      description: questionToRemove.description || '',
      optional: questionToRemove.optional || false,
      variants: questionToRemove.variants || null,
      index: index,
    };

    remove(index);

    toast('Question removed', {
      description: 'You can restore it within 10 seconds',
      position: 'top-right',
      action: {
        label: 'Restore',
        onClick: () => {
          insert(
            index,
            {
              order: index + 1,
              question: questionData.question,
              type: questionData.type,
              description: questionData.description,
              optional: questionData.optional,
              variants: questionData.variants || null,
            },
            {
              shouldFocus: false,
            },
          );
        },
      },
      className: 'pointer-events-auto',
      duration: 10000,
    });
  };

  const handleDuplicateQuestion = (
    question: string,
    type: QuestionType,
    description: string,
    optional: boolean,
    variants: string[] | null,
    sourceIndex: number,
  ) => {
    const insertIndex = sourceIndex + 1;

    insert(insertIndex, {
      order: insertIndex + 1,
      question: question,
      type: type,
      description: description,
      optional: optional,
      variants: variants || null,
    });

    fields.forEach((_, index) => {
      form.setValue(`eligibility.${index}.order`, index + 1);
    });
  };

  useEffect(() => {
    if (!isEditing) {
      if (type === 'project' || type === 'sponsorship') {
        if (fields.length === 0) {
          handleAddQuestion(false);
        }
      } else {
        if (type === 'hackathon' && currentHackathon?.eligibility) {
          form.setValue('eligibility', currentHackathon?.eligibility as any);
        } else {
          if (fields.length > 0) {
            form.setValue('eligibility', fields.slice(0, 2));
          } else {
            form.setValue('eligibility', []);
          }
        }
      }
    }
  }, [type, currentHackathon, isEditing]);

  return (
    <FormField
      control={form.control}
      name={`eligibility`}
      render={() => (
        <FormItem className="gap-2 pt-2">
          <p className="text-xs font-medium uppercase text-slate-500">
            Custom Questions
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <EligibilityQuestion
                    key={field.id}
                    id={field.id}
                    index={index}
                    fields={fields}
                    handleRemoveQuestion={handleRemoveQuestion}
                    handleDuplicateQuestion={handleDuplicateQuestion}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="w-full rounded-md bg-white opacity-80 shadow-lg">
                  {fields.map((field, index) =>
                    field.id === activeId ? (
                      <EligibilityQuestion
                        id={activeId}
                        key={activeId}
                        index={index}
                        fields={fields}
                        handleRemoveQuestion={handleRemoveQuestion}
                        handleDuplicateQuestion={handleDuplicateQuestion}
                      />
                    ) : null,
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          {type !== 'bounty' || fields.length < 2 ? (
            <div className="flex justify-between">
              <FormMessage />
              <Button
                type="button"
                variant={fields.length === 0 ? 'outline' : 'link'}
                size="sm"
                className={cn(
                  fields.length > 0 && 'ml-auto flex w-fit px-0',
                  fields.length === 0 && 'mt-2 w-full text-slate-500',
                )}
                onClick={() => handleAddQuestion()}
              >
                <Plus /> Add Question
              </Button>
            </div>
          ) : (
            <FormDescription>
              Max two custom questions allow for bounties
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
