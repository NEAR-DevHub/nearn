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
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/utils/cn';

import { hackathonsAtom, isEditingAtom } from '../../../atoms';
import { useListingForm } from '../../../hooks';
import EligibilityQuestion from './Question';
import type { QuestionType } from './Question/Type';

interface ToastWithProgressProps {
  message: string;
  undoAction: () => void;
  dismissToast: () => void;
  duration?: number;
}

function ToastWithProgress({
  message,
  undoAction,
  dismissToast,
  duration = 10000,
}: ToastWithProgressProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [adjustedStartTime, setAdjustedStartTime] = useState(Date.now());

  useEffect(() => {
    setAdjustedStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - adjustedStartTime;
      const remaining = Math.max(0, duration - elapsed);
      const remainingPercentage = (remaining / duration) * 100;

      setProgress(remainingPercentage);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, adjustedStartTime, isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    setPausedAt(Date.now());
  };

  const handleMouseLeave = () => {
    if (pausedAt) {
      const pauseDuration = Date.now() - pausedAt;
      setAdjustedStartTime((prev) => prev + pauseDuration);
      setPausedAt(null);
    }
    setIsPaused(false);
  };

  return (
    <div
      className="flex w-full justify-between"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2">
        <span className="text-slate-600">{message}</span>
      </div>
      <Button
        variant="outline"
        className="pointer-events-auto h-7 cursor-pointer px-3 py-1 text-slate-600"
        size="sm"
        onClick={() => {
          undoAction();
          dismissToast();
        }}
      >
        Undo
      </Button>
      <div
        className={cn(
          'absolute -bottom-[1px] left-[1px] right-[1px] top-[80%] w-full rounded-bl-sm border-b-2 border-b-emerald-700 bg-transparent transition-all',
          progress > 98 && 'rounded-br-sm',
          isPaused ? 'duration-0' : 'duration-75 ease-linear',
        )}
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

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

      form.saveDraft();
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

    form.saveDraft();
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

    toast.custom(
      (t) => (
        <ToastWithProgress
          message="Question Deleted"
          undoAction={() => {
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

            form.saveDraft();
          }}
          dismissToast={() => toast.dismiss(t)}
          duration={10000}
        />
      ),
      {
        dismissible: false,
        position: 'top-right',
        className:
          'pointer-events-auto bg-white border w-full max-w-72 border-slate-200 shadow-lg rounded-lg py-4 px-3',
        duration: 10000,
      },
    );

    form.saveDraft();
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

    form.saveDraft();
  };

  useEffect(() => {
    if (!isEditing) {
      if (type === 'project' || type === 'sponsorship') {
        if (fields.length === 0) {
          handleAddQuestion(false);
        }
      } else if (type === 'hackathon' && currentHackathon?.eligibility) {
        form.setValue('eligibility', currentHackathon?.eligibility as any);
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
        </FormItem>
      )}
    />
  );
}
