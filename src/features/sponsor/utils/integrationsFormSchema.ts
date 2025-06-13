import { z } from 'zod';

import {
  extractDaoFromTreasury,
  isNearnIoRequestor,
  NEAR_ACCOUNT,
} from '@/utils/near';

export const nearTreasuryFormSchema = z
  .object({
    nearTreasuryFrontend: z
      .string()
      .nullable()
      .refine((value) => !value || value.endsWith('near.page'), {
        message: 'NEAR Treasury Frontend must end with "near.page"',
      })
      .transform((value) => value?.replace('https://', '') ?? null),
  })
  .transform(async (data) => ({
    nearTreasuryFrontend: data.nearTreasuryFrontend,
    nearTreasuryDao: data.nearTreasuryFrontend
      ? await extractDaoFromTreasury(data.nearTreasuryFrontend.slice(0, -5))
      : null,
  }))
  .superRefine(async (data, ctx) => {
    if (!!data.nearTreasuryFrontend && !data.nearTreasuryDao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Could not extract DAO from Near Treasury. Did you provide the correct URL?`,
        path: ['nearTreasuryFrontend'],
      });
    }

    if (!!data.nearTreasuryFrontend && data.nearTreasuryDao) {
      const isRequestor = await isNearnIoRequestor(data.nearTreasuryDao);
      if (!isRequestor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${NEAR_ACCOUNT} doesn't have rights to add proposals in the provided NEAR Treasury`,
          path: ['nearTreasuryFrontend'],
        });
      }
    }
  });

export type NearTreasuryFormValues = z.infer<typeof nearTreasuryFormSchema>;
