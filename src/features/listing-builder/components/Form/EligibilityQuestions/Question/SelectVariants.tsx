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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormField, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';

import { useListingForm } from '@/features/listing-builder/hooks';

interface VariantsArrayProps {
  index: number;
}

function SortableVariant({
  index,
  variantIndex,
  id,
  onRemove,
}: {
  index: number;
  variantIndex: number;
  id: string;
  onRemove: (index: number) => void;
}) {
  const { control } = useFormContext();
  const form = useListingForm();
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-50')}
    >
      <FormField
        control={control}
        name={`eligibility.${index}.variants.${variantIndex}`}
        render={({ field }) => (
          <div className="group/variant flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex w-full items-center gap-2 border-b border-slate-200">
              <Textarea
                {...field}
                placeholder="Enter your option"
                className="min-h-[20px] resize-none overflow-hidden border-none pl-0 font-medium !text-muted-foreground shadow-none focus-visible:ring-0"
                rows={1}
                onChange={(e) => {
                  field.onChange(e);
                  form.saveDraft();
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 p-0 text-slate-500 opacity-0 group-hover/variant:opacity-100 hover:bg-transparent hover:text-destructive"
                onClick={() => onRemove(variantIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      />
      <FormMessage className="pl-6" />
    </div>
  );
}

export default function QuestionSelectVariants({ index }: VariantsArrayProps) {
  const form = useListingForm();
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `eligibility.${index}.variants`,
  });

  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleAddVariant = () => {
    append('', { shouldFocus: true });
    form.saveDraft();
  };

  const handleRemoveVariant = (variantIndex: number) => {
    remove(variantIndex);
    form.saveDraft();
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveVariantId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveVariantId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      move(oldIndex, newIndex);
    }
    form.saveDraft();
  };

  return (
    <div className="pl-2">
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
          {fields?.map((field, variantIndex) => (
            <SortableVariant
              key={field.id}
              id={field.id}
              index={index}
              variantIndex={variantIndex}
              onRemove={handleRemoveVariant}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeVariantId ? (
            <div className="w-full rounded-md bg-white opacity-80 shadow-lg">
              {fields.map((field, variantIndex) =>
                field.id === activeVariantId ? (
                  <SortableVariant
                    key={activeVariantId}
                    id={activeVariantId}
                    index={index}
                    variantIndex={variantIndex}
                    onRemove={handleRemoveVariant}
                  />
                ) : null,
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Button
        variant="ghost"
        className="w-full justify-start pl-6 text-slate-400 hover:bg-transparent hover:text-slate-500"
        onClick={handleAddVariant}
      >
        Add Option
      </Button>
    </div>
  );
}
