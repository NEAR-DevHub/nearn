import { z } from 'zod';

export const allDeadlineShouldBeConsequitive = (
  val: { deadline: string | Date; milestoneIndex: number }[],
  ctx: z.RefinementCtx,
) => {
  const deadlines = val
    .sort((a, b) => a.milestoneIndex - b.milestoneIndex)
    .map((milestone) => new Date(milestone.deadline!));
  for (let i = 1; i < deadlines.length; i++) {
    if (deadlines[i]!.getTime() <= deadlines[i - 1]!.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'deadline'],
        message: 'Due date must be after the previous date',
      });
    }
  }
};

export const milestoneSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  deadline: z.string().datetime(),
  reward: z.number().positive('Reward must be greater than 0'),
  milestoneIndex: z.number().int().positive(),
});

export const createMilestonesSchema = z.object({
  submissionId: z.string().uuid(),
  useSingleMilestone: z.boolean(),
  milestones: z
    .array(milestoneSchema)
    .superRefine(allDeadlineShouldBeConsequitive)
    .optional(),
});

export const editMilestonesSchema = z.object({
  submissionId: z.string().uuid(),
  milestones: z
    .array(milestoneSchema)
    .min(1)
    .superRefine(allDeadlineShouldBeConsequitive),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;
export type CreateMilestonesData = z.infer<typeof createMilestonesSchema>;
