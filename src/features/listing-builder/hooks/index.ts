import { zodResolver } from '@hookform/resolvers/zod';
import { type Hackathon } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef } from 'react';
import { useForm, useFormContext, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { dayjs } from '@/utils/dayjs';

import {
  descriptionKeyAtom,
  hackathonsAtom,
  hideAutoSaveAtom,
  isDraftSavingAtom,
  isEditingAtom,
  isGodAtom,
  isListingInReviewAtom,
  isSTAtom,
  saveDraftMutationAtom,
  skillsKeyAtom,
  submitListingMutationAtom,
} from '../atoms';
import { type ListingFormData, type ValidationFields } from '../types';
import {
  createListingFormSchema,
  createListingRefinements,
} from '../types/schema';
import { getListingDefaults, refineReadyListing } from '../utils/form';

const formatDraftData = (data: Partial<ListingFormData>) => {
  if (data.deadline) {
    if (!data.deadline.endsWith('Z')) data.deadline += dayjs().format('Z');
  }
  return data;
};

interface UseListingFormReturn extends UseFormReturn<ListingFormData> {
  saveDraft: () => void;
  submitListing: () => Promise<ListingFormData>;
  resetForm: () => void;
  validateRewards: () => Promise<boolean>;
  validateBasics: () => Promise<boolean>;
  validateEligibilityQuestions: () => Promise<boolean>;
}

export const useListingForm = (
  defaultValues?: ListingFormData,
  hackathons?: Hackathon[],
): UseListingFormReturn => {
  let formMethods: UseFormReturn<ListingFormData> | null = null;
  let isNewFormInitialized = false;

  try {
    //eslint-disable-next-line
    formMethods = useFormContext<ListingFormData>();
  } catch (error) {
    // No existing form context
  }

  const isGod = useAtomValue(isGodAtom);
  const isEditing = useAtomValue(isEditingAtom);
  const isST = useAtomValue(isSTAtom);
  const isInReviewListing = useAtomValue(isListingInReviewAtom);

  const setDescriptionKey = useSetAtom(descriptionKeyAtom);
  const setSkillsKey = useSetAtom(skillsKeyAtom);

  const hackathonsAtomed = useAtomValue(hackathonsAtom);
  hackathons = hackathons || hackathonsAtomed;
  const formSchema = createListingFormSchema({
    isGod,
    isEditing,
    isST,
    pastListing: defaultValues as any,
    hackathons: hackathons,
    isInReviewListing,
  });
  if (!formMethods || !Object.keys(formMethods).length) {
    //eslint-disable-next-line
    formMethods = useForm<ListingFormData>({
      resolver: zodResolver(formSchema),
      defaultValues,
      mode: 'onTouched',
    });
    isNewFormInitialized = true;
  }

  const { getValues, reset } = formMethods;

  const queryClient = useQueryClient();
  const saveDraftMutation = useAtomValue(saveDraftMutationAtom);
  const submitListingMutation = useAtomValue(submitListingMutationAtom);
  const [, setDraftSaving] = useAtom(isDraftSavingAtom);
  const [, setHideAutoSave] = useAtom(hideAutoSaveAtom);

  const saveDraft = useCallback(async () => {
    if (isEditing) return;
    setDraftSaving(true);
    try {
      const listingData = getValues();
      const dataToSave = formatDraftData(listingData);
      const data = await saveDraftMutation.mutateAsync(dataToSave);
      setHideAutoSave(false);
      formMethods.setValue('id', data.id);
      if (!dataToSave.slug) formMethods.setValue('slug', data.slug);
    } catch (error) {
      console.log('Error saving draft', error);
    } finally {
      setDraftSaving(false);
    }
  }, [
    getValues,
    saveDraftMutation,
    formMethods,
    setHideAutoSave,
    setDraftSaving,
    isEditing,
  ]);

  const latestSaveDraftRef = useRef<() => void>(saveDraft);
  useEffect(() => {
    latestSaveDraftRef.current = saveDraft;
  }, [saveDraft]);

  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null);
  useEffect(() => {
    debouncedRef.current = debounce(latestSaveDraftRef.current, 1000);
    return () => debouncedRef.current?.cancel();
  }, []);

  const onChange = useCallback(() => {
    setHideAutoSave(true);
    if (!isEditing) {
      debouncedRef.current?.();
    }
  }, [isEditing]);

  const submitListing = useCallback(async () => {
    const formData = refineReadyListing(getValues());
    const data = await submitListingMutation.mutateAsync(formData);
    queryClient.invalidateQueries({
      queryKey: ['sponsor-dashboard-listing', data.slug],
    });
    return data;
  }, [getValues, submitListingMutation]);

  const resetForm = useCallback(() => {
    const defaultValues = getListingDefaults({
      isGod,
      isEditing,
      isST,
      hackathons,
      type: getValues().type,
      hackathonId: undefined,
    });
    reset({
      ...getValues(),
      ...defaultValues,
      id: getValues().id,
      slug: getValues().slug,
      eligibility: [],
      skills: [],
    });
    setDescriptionKey((s) => {
      if (typeof s === 'number') return s + 1;
      else return 1;
    });
    setSkillsKey((s) => {
      if (typeof s === 'number') return s + 1;
      else return 1;
    });
  }, [reset]);

  const validateFields = useCallback(
    async (fields: ValidationFields) => {
      const values = formMethods.getValues();

      // Transform array rewards if is array
      if ('rewards' in fields && Array.isArray(values.rewards)) {
        const rewardsObject: Record<string, number> = {};
        let index = 1;
        for (const value of values.rewards.filter(Boolean)) {
          rewardsObject[index] = value;
          index += 1;
        }
        if (Object.keys(rewardsObject).length === 0) {
          rewardsObject[1] = NaN;
        }
        formMethods.setValue('rewards', rewardsObject);
        values.rewards = rewardsObject;
      }

      const innerSchema = formSchema._def.schema;
      const partialSchema = innerSchema
        .pick(fields)
        .superRefine((data, ctx) => {
          createListingRefinements(data as any, ctx, hackathons, fields);
        });

      try {
        formMethods.clearErrors(
          Object.keys(fields) as Array<keyof ListingFormData>,
        );
        await partialSchema.parseAsync(values);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            const fieldName = err.path.join('.') as keyof ListingFormData;
            formMethods.setError(fieldName, {
              type: err.code,
              message: err.message,
            });
          });
        }
        return false;
      }
    },
    [formMethods, formSchema, isGod, isEditing, isST],
  );

  const validateEligibilityQuestions = () =>
    validateFields({
      type: true,
      compensationType: true,
      eligibility: true,
      multipleSubmissionRule: true,
      submissionLimit: true,
    });

  const validateRewards = () =>
    validateFields({
      type: true,
      compensationType: true,
      token: true,
      rewardAmount: true,
      rewards: true,
      minRewardAsk: true,
      maxRewardAsk: true,
      maxBonusSpots: true,
    });

  const validateBasics = () =>
    validateFields({
      title: true,
      type: true,
      description: true,
      rewards: true,
      deadline: true,
      skills: true,
      pocSocials: true,
      eligibility: true,
      compensationType: true,
      token: true,
      rewardAmount: true,
      minRewardAsk: true,
      maxRewardAsk: true,
      maxBonusSpots: true,
    });

  useEffect(() => {
    if (isNewFormInitialized && process.env.NODE_ENV !== 'production') {
      console.warn(
        'useListingForm: Initialized a new form instance because no form context was found. If this is unintended, ensure your component is wrapped with FormProvider.',
      );
    }
  }, [isNewFormInitialized]);

  return {
    ...formMethods,
    saveDraft: onChange,
    submitListing,
    resetForm,
    validateRewards,
    validateBasics,
    validateEligibilityQuestions,
  };
};
