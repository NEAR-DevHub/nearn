import { useCallback, useEffect } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { type z } from 'zod';

import { type submissionSchema } from '../utils/submissionFormSchema';

type FormData = z.infer<ReturnType<typeof submissionSchema>>;

const STORAGE_PREFIX = 'submission_draft_';
const STORAGE_VERSION = '1';

interface StoredDraft {
  version: string;
  timestamp: number;
  data: Partial<FormData>;
}

export const useSubmissionDraft = (
  listingId: string | null,
  form: UseFormReturn<FormData>,
  isEditMode: boolean,
) => {
  const storageKey = listingId ? `${STORAGE_PREFIX}${listingId}` : null;

  // Load saved draft from local storage
  const loadDraft = useCallback(() => {
    if (!storageKey || isEditMode) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const draft: StoredDraft = JSON.parse(stored);

      // Check version compatibility
      if (draft.version !== STORAGE_VERSION) {
        localStorage.removeItem(storageKey);
        return;
      }

      // Apply saved values to form
      const currentValues = form.getValues();
      form.reset({
        ...currentValues,
        ...draft.data,
        // Preserve eligibility structure from current form
        eligibilityAnswers: currentValues.eligibilityAnswers?.map(
          (q, index) => ({
            question: q.question,
            answer: draft.data.eligibilityAnswers?.[index]?.answer || '',
          }),
        ),
      });
    } catch (error) {
      console.error('Error loading draft:', error);
      // Remove corrupted data
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, form, isEditMode]);

  // Save draft to local storage
  const saveDraft = useCallback(
    (data: Partial<FormData>) => {
      if (!storageKey || isEditMode) return;
      try {
        const draft: StoredDraft = {
          version: STORAGE_VERSION,
          timestamp: Date.now(),
          data,
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    },
    [storageKey, isEditMode],
  );

  // Clear draft from local storage
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [storageKey]);

  // Auto-save form data
  useEffect(() => {
    if (!storageKey || isEditMode) return;

    const subscription = form.watch((value) => {
      saveDraft(value as Partial<FormData>);
    });

    return () => subscription.unsubscribe();
  }, [form, saveDraft, storageKey, isEditMode]);

  return {
    loadDraft,
    clearDraft,
  };
};
