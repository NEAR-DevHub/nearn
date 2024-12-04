import { type NextApiRequest, type NextApiResponse } from 'next';
import { z } from 'zod';

import { prisma } from '@/prisma';

const CategoryEnum = z.enum(['design', 'content', 'development', 'other']);
type CategoryKeys = z.infer<typeof CategoryEnum>;

const querySchema = z.object({
  filter: CategoryEnum,
});

export default async function categoryEarnings(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { filter } = querySchema.parse(req.query);

    const filterToSkillsMap: Record<CategoryKeys, string[]> = {
      development: ['Frontend', 'Backend', 'Blockchain', 'Mobile'],
      design: ['Design'],
      content: ['Content'],
      other: ['Other', 'Growth', 'Community'],
    };

    const skillsToFilter = filterToSkillsMap[filter] || [];
    let skillsFilter = {};

    if (skillsToFilter.length > 0) {
      if (filter === 'development' || filter === 'other') {
        skillsFilter = {
          OR: skillsToFilter.map((skill) => ({
            skills: {
              path: '$[*].skills',
              array_contains: [skill],
            },
          })),
        };
      } else {
        skillsFilter = {
          skills: {
            path: '$[*].skills',
            array_contains: skillsToFilter,
          },
        };
      }
    }

    const result = await prisma.bounties.aggregate({
      where: {
        isWinnersAnnounced: true,
        isPublished: true,
        status: 'OPEN',
        ...skillsFilter,
      },
      _sum: {
        usdValue: true,
      },
    });

    return res.status(200).json({
      totalEarnings: result._sum.usdValue || 0,
    });
  } catch (error) {
    console.error('Error in categoryEarnings:', error);
    return res.status(400).json({ error: 'Invalid request' });
  }
}
