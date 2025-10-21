import { dayjs } from '@/utils/dayjs';
import { formatNumberWithSuffix } from '@/utils/formatNumberWithSuffix';
import { nthLabelGenerator } from '@/utils/rank';

import {
  type EventData,
  type EventType,
} from '@/features/logging/types/event-data';

import type { LogProperties } from './index';
import { renderSimpleFieldChange } from './utils';

interface Milestone {
  milestoneIndex: number;
  title: string;
  reward: number;
  status: string;
  description?: string;
  deadline?: string | Date;
}

function formatValue(field: string, value: any): string | React.ReactNode {
  if (value === null || value === undefined) {
    return 'empty';
  }

  if (field === 'deadline' && value) {
    return dayjs(value).format('h:mm A, MMMM D, YYYY');
  }

  if (field === 'reward' && typeof value === 'number') {
    return formatNumberWithSuffix(value, 1);
  }

  return value.toString();
}

function renderMilestoneChanges(
  oldMilestones: Milestone[],
  newMilestones: Milestone[],
): React.ReactNode[] {
  const changes: React.ReactNode[] = [];
  const oldMap = new Map<number, Milestone>();
  const newMap = new Map<number, Milestone>();

  oldMilestones.forEach((m) => oldMap.set(m.milestoneIndex, m));
  newMilestones.forEach((m) => newMap.set(m.milestoneIndex, m));

  // Check for deleted milestones
  oldMap.forEach((_, index) => {
    if (!newMap.has(index)) {
      changes.push(
        <span key={`deleted-${index}`} className="text-slate-500">
          {nthLabelGenerator(index)} milestone was deleted
        </span>,
      );
    }
  });

  // Check for added or edited milestones
  newMap.forEach((newMilestone, index) => {
    const oldMilestone = oldMap.get(index);

    if (!oldMilestone) {
      changes.push(
        <span key={`added-${index}`} className="text-slate-500">
          Added {nthLabelGenerator(index)} milestone
        </span>,
      );
    } else {
      // Check individual field changes
      if (oldMilestone.title !== newMilestone.title) {
        changes.push(
          <span key={`title-${index}`} className="text-slate-500">
            Edited {nthLabelGenerator(index)} milestone title
          </span>,
        );
      }

      if (oldMilestone.description !== newMilestone.description) {
        const wasEmpty = !oldMilestone.description;
        const isNowEmpty = !newMilestone.description;
        const change = renderSimpleFieldChange(
          wasEmpty,
          isNowEmpty,
          `${nthLabelGenerator(index)} milestone description`,
          undefined,
          undefined,
          { includeValue: false },
        );
        if (change) {
          changes.push(<span key={`desc-${index}`}>{change}</span>);
        }
      }

      if (oldMilestone.deadline !== newMilestone.deadline) {
        const formattedDate = newMilestone.deadline
          ? formatValue('deadline', newMilestone.deadline)
          : null;
        if (formattedDate) {
          changes.push(
            <span key={`deadline-${index}`} className="text-slate-500">
              The due date for {nthLabelGenerator(index)} milestone has been
              updated to {formattedDate}
            </span>,
          );
        }
      }

      if (oldMilestone.reward !== newMilestone.reward) {
        changes.push(
          <span key={`reward-${index}`} className="text-slate-500">
            {nthLabelGenerator(index)} milestone amount was changed from{' '}
            {formatValue('reward', oldMilestone.reward)} to{' '}
            {formatValue('reward', newMilestone.reward)}
          </span>,
        );
      }
    }
  });

  return changes;
}

export default function MilestonesEdited({ event }: LogProperties) {
  const data = event.data as EventData<EventType.MILESTONES_EDITED>;

  if (!data.oldMilestones || !data.newMilestones) {
    return <p className="text-slate-500">Edited milestones</p>;
  }

  const changeElements = renderMilestoneChanges(
    data.oldMilestones,
    data.newMilestones,
  );

  if (changeElements.length === 0) {
    return <p className="text-slate-500">Edited milestones</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {changeElements.map((element, index) => (
        <div key={index}>{element}</div>
      ))}
    </div>
  );
}
