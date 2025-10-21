import { z } from 'zod';

export const milestoneSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  reward: z.number().positive('Reward must be greater than 0'),
  milestoneIndex: z.number().int().positive(),
});

export const createMilestonesSchema = z.object({
  submissionId: z.string().uuid(),
  useSingleMilestone: z.boolean(),
  milestones: z.array(milestoneSchema).optional(),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;
export type CreateMilestonesData = z.infer<typeof createMilestonesSchema>;
