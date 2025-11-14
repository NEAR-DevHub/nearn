import axios from 'axios';
import { z } from 'zod';

import {
  extractDaoFromTreasury,
  isNearnIoRequestor,
  isValidDaoPolicy,
} from '@/utils/near';
import { getURL } from '@/utils/validUrl';

export const NEARN_NO_REQUESTOR_RIGHTS = 'NEARN_NO_REQUESTOR_RIGHTS';

const dataFromBosFrontend = async (treasuryFrontendLink: string) => {
  let accountId;
  if (treasuryFrontendLink?.startsWith('near.social/')) {
    accountId = treasuryFrontendLink?.slice(12).split('/')[0];
  } else if (treasuryFrontendLink?.startsWith('dev.near.org/')) {
    accountId = treasuryFrontendLink?.slice(13).split('/')[0];
  } else {
    accountId = treasuryFrontendLink?.split('.page')[0];
  }

  const dao = await extractDaoFromTreasury(accountId!);

  return {
    nearTreasuryDao: dao,
    nearTreasuryFrontend: 'https://app.neartreasury.com/' + dao,
  };
};

export const nearTreasuryFormSchema = z
  .object({
    nearTreasuryFrontend: z
      .string()
      .url()
      .nullable()
      .refine(
        (value) =>
          !value ||
          value.includes('.near.page') ||
          value.startsWith('https://near.social/') ||
          value.startsWith('near.social/') ||
          value.startsWith('https://dev.near.org/') ||
          value.startsWith('dev.near.org/') ||
          value.startsWith('https://app.neartreasury.com/') ||
          value.startsWith('app.neartreasury.com/'),
        {
          message:
            'Please provide a valid NEAR Treasury Link. (app.neartreasury.com, near.page, near.social, dev.near.org)',
        },
      )
      .transform((value) => value?.replaceAll('https://', '') ?? null),
  })
  .transform(async (data) => {
    const isApp = data.nearTreasuryFrontend?.startsWith(
      'app.neartreasury.com/',
    );

    if (isApp && data.nearTreasuryFrontend) {
      const dao = data.nearTreasuryFrontend?.split('/')[1];
      return {
        nearTreasuryFrontend: 'https://app.neartreasury.com/' + dao,
        nearTreasuryDao: dao,
      };
    } else if (data.nearTreasuryFrontend) {
      return await dataFromBosFrontend(data.nearTreasuryFrontend);
    } else {
      return {
        nearTreasuryFrontend: null,
        nearTreasuryDao: null,
      };
    }
  })
  .superRefine(async (data, ctx) => {
    if (!!data.nearTreasuryFrontend && !data.nearTreasuryDao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Could not extract DAO from Near Treasury. Did you provide the correct URL?`,
        path: ['nearTreasuryFrontend'],
      });
    }

    if (!!data.nearTreasuryFrontend && data.nearTreasuryDao) {
      const {
        data: { available },
      } = await axios.get<{ available: boolean }>(
        `${getURL()}/api/sponsors/check-near-treasury?dao=${data.nearTreasuryDao}`,
      );
      if (!available) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Sputnik DAO is already connected to another sponsor and not available`,
          path: ['nearTreasuryFrontend'],
        });
      }
    }

    if (!!data.nearTreasuryFrontend && data.nearTreasuryDao) {
      const isRequestor = await isNearnIoRequestor(data.nearTreasuryDao);
      if (!isRequestor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `[${NEARN_NO_REQUESTOR_RIGHTS}]${data.nearTreasuryFrontend}`,
          path: ['nearTreasuryFrontend'],
        });
      }
    }

    if (!!data.nearTreasuryFrontend && data.nearTreasuryDao) {
      if (!(await isValidDaoPolicy(data.nearTreasuryDao))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The proposal bond is larger than 1 NEAR. The NEAR Treasury integration is not compatible with NEARN.`,
          path: ['nearTreasuryFrontend'],
        });
      }
    }
  });

export type NearTreasuryFormValues = z.infer<typeof nearTreasuryFormSchema>;
