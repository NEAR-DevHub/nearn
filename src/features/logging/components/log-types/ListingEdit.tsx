import { tokenList } from '@/constants/tokenList';
import { dayjs } from '@/utils/dayjs';
import { formatNumberWithSuffix } from '@/utils/formatNumberWithSuffix';

import {
  type EventData,
  type EventType,
} from '@/features/logging/types/event-data';

import type { LogProperties } from './index';
import { renderSimpleFieldChange } from './utils';

interface EligibilityQuestion {
  question: string;
  order: number;
}

interface Skill {
  skills: string;
  subskills: string[];
}

function formatValue(field: string, value: any): string | React.ReactNode {
  if (value === null || value === undefined) {
    return 'empty';
  }

  if (field === 'token') {
    const tokenObject = tokenList.find((t) => t.tokenSymbol === value);
    if (tokenObject) {
      return (
        <span className="inline-flex items-center gap-1">
          <img
            src={tokenObject.icon}
            alt={tokenObject.tokenSymbol}
            className="h-4 w-4 rounded-full"
          />
          <span>{value}</span>
        </span>
      );
    }
    return value;
  }

  if (field === 'deadline' && value) {
    return dayjs(value).format('h:mm A, MMMM D, YYYY');
  }

  if (field === 'rewards' && typeof value === 'object') {
    const rewards = value as Record<string, number>;
    const rewardValues = Object.values(rewards).filter((v) => v > 0);
    if (rewardValues.length === 1) {
      return formatNumberWithSuffix(rewardValues[0] ?? 0, 1);
    }
    return `${rewardValues.length} reward tiers`;
  }

  if (field === 'skills' && Array.isArray(value)) {
    return value.map((s: Skill) => s.skills).join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return formatNumberWithSuffix(value, 1);
  }

  return value.toString();
}

function renderEligibilityChanges(
  oldQuestions: EligibilityQuestion[] | null,
  newQuestions: EligibilityQuestion[] | null,
): React.ReactNode[] {
  const changes: React.ReactNode[] = [];
  const oldMap = new Map<string, EligibilityQuestion>();
  const newMap = new Map<string, EligibilityQuestion>();

  if (oldQuestions && Array.isArray(oldQuestions)) {
    oldQuestions.forEach((item) => {
      if (item.question) oldMap.set(item.question, item);
    });
  }

  if (newQuestions && Array.isArray(newQuestions)) {
    newQuestions.forEach((item) => {
      if (item.question) newMap.set(item.question, item);
    });
  }

  // Check for removed questions
  oldMap.forEach((_, question) => {
    if (!newMap.has(question)) {
      changes.push(
        <span key={`removed-${question}`} className="text-slate-500">
          Deleted question &quot;<span className="font-medium">{question}</span>
          &quot; from the application form
        </span>,
      );
    }
  });

  // Check for added questions
  newMap.forEach((_, question) => {
    if (!oldMap.has(question)) {
      changes.push(
        <span key={`added-${question}`} className="text-slate-500">
          Added a new question &quot;
          <span className="font-medium">{question}</span>&quot; to the
          application form
        </span>,
      );
    }
  });

  return changes;
}

function renderSkillChanges(
  oldSkills: Skill[] | null,
  newSkills: Skill[] | null,
): React.ReactNode {
  const oldSkillSet = new Set<string>();
  const newSkillSet = new Set<string>();

  if (oldSkills && Array.isArray(oldSkills)) {
    oldSkills.forEach((s) => {
      oldSkillSet.add(s.skills);
      s.subskills?.forEach((sub) => oldSkillSet.add(sub));
    });
  }

  if (newSkills && Array.isArray(newSkills)) {
    newSkills.forEach((s) => {
      newSkillSet.add(s.skills);
      s.subskills?.forEach((sub) => newSkillSet.add(sub));
    });
  }

  const removed = Array.from(oldSkillSet).filter((s) => !newSkillSet.has(s));
  const added = Array.from(newSkillSet).filter((s) => !oldSkillSet.has(s));

  if (removed.length === 0 && added.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-slate-500">
      Updated skills:{' '}
      <div className="flex flex-wrap gap-1">
        {removed.length > 0 && (
          <>
            removed{' '}
            {removed.map((skill, idx) => (
              <span key={`removed-${idx}`}>
                <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                  {skill}
                </span>
              </span>
            ))}
          </>
        )}
      </div>
      {added.length > 0 && (
        <>
          added{' '}
          {added.map((skill, idx) => (
            <span key={`added-${idx}`}>
              <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                {skill}
              </span>
            </span>
          ))}
        </>
      )}
    </span>
  );
}

function renderFieldChange(
  field: string,
  oldValue: any,
  newValue: any,
  token?: string,
): React.ReactNode {
  const formattedOld = formatValue(field, oldValue);
  const formattedNew = formatValue(field, newValue);

  // Handle empty/null cases
  const wasEmpty =
    oldValue === null || oldValue === undefined || oldValue === '';
  const isNowEmpty =
    newValue === null || newValue === undefined || newValue === '';

  switch (field) {
    case 'title':
      return (
        <span className="text-slate-500">
          Renamed from &quot;<span className="font-medium">{formattedOld}</span>
          &quot; to{' '}
          <span className="font-medium">&quot;{formattedNew}&quot;</span>
        </span>
      );

    case 'description':
      return <span className="text-slate-500">Edited bounty description</span>;

    case 'pocSocials':
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        'point of contact',
        formattedNew,
        formattedOld,
      );

    case 'deadline':
      return (
        <p className="text-slate-500">
          The deadline for this listing has been updated to {formattedNew}
        </p>
      );

    case 'rewards':
      if (token) {
        const tokenObject = tokenList.find((t) => t.tokenSymbol === token);
        const oldRewards = oldValue as Record<string, number>;
        const newRewards = newValue as Record<string, number>;
        const oldTotal = Object.values(oldRewards || {}).reduce(
          (sum, v) => sum + v,
          0,
        );
        const newTotal = Object.values(newRewards || {}).reduce(
          (sum, v) => sum + v,
          0,
        );

        return (
          <span className="inline-flex flex-wrap items-center gap-1 text-slate-500">
            The reward amount was changed from{' '}
            {formatNumberWithSuffix(oldTotal, 1)}{' '}
            {tokenObject && (
              <>
                <img
                  src={tokenObject.icon}
                  alt={tokenObject.tokenSymbol}
                  className="h-4 w-4 rounded-full"
                />
                {token}
              </>
            )}{' '}
            to {formatNumberWithSuffix(newTotal, 1)}{' '}
            {tokenObject && (
              <>
                <img
                  src={tokenObject.icon}
                  alt={tokenObject.tokenSymbol}
                  className="h-4 w-4 rounded-full"
                />
                {token}
              </>
            )}
          </span>
        );
      }
      return <span className="text-slate-500">Updated reward structure</span>;

    case 'skills':
      return renderSkillChanges(oldValue as Skill[], newValue as Skill[]);

    case 'region':
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        'region',
        formattedNew,
        formattedOld,
        {
          actionVerbs: { added: 'Set', removed: 'Removed', changed: 'Changed' },
        },
      );

    case 'isPrivate':
      return (
        <span className="text-slate-500">
          Made listing {newValue ? 'private' : 'public'}
        </span>
      );

    case 'token':
      return (
        <span className="inline-flex flex-wrap items-center gap-1 text-slate-500">
          Changed payment token from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
      );

    case 'compensationType':
    case 'minRewardAsk':
    case 'maxRewardAsk':
    case 'maxBonusSpots':
      const fieldLabels: Record<string, string> = {
        compensationType: 'compensation type',
        minRewardAsk: 'minimum reward',
        maxRewardAsk: 'maximum reward',
        maxBonusSpots: 'bonus spots',
      };
      return (
        <span className="text-slate-500">
          Changed {fieldLabels[field] || field} from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
      );

    default:
      return <span className="text-slate-500">Updated {field}</span>;
  }
}

export default function ListingEdit({ event }: LogProperties) {
  const data = event.data as EventData<EventType.LISTING_EDITED>;

  if (!data.changes || data.changes.length === 0) {
    return <p className="text-slate-500">Edited listing</p>;
  }

  const changeElements: React.ReactNode[] = [];
  let currentToken: string | undefined;

  // Find the token for reward changes
  const tokenChange = data.changes.find((c) => c.field === 'token');
  if (tokenChange) {
    currentToken =
      (tokenChange.newValue as string) || (tokenChange.oldValue as string);
  }

  data.changes.forEach((change, index) => {
    if (change.field === 'eligibility') {
      const eligibilityChanges = renderEligibilityChanges(
        change.oldValue as EligibilityQuestion[] | null,
        change.newValue as EligibilityQuestion[] | null,
      );
      changeElements.push(...eligibilityChanges);
    } else if (change.field === 'skills') {
      const skillChange = renderSkillChanges(
        change.oldValue as Skill[] | null,
        change.newValue as Skill[] | null,
      );
      if (skillChange) {
        changeElements.push(<div key={index}>{skillChange}</div>);
      }
    } else {
      const fieldChange = renderFieldChange(
        change.field,
        change.oldValue,
        change.newValue,
        change.field === 'rewards' ? currentToken : undefined,
      );
      if (fieldChange) {
        changeElements.push(<div key={index}>{fieldChange}</div>);
      }
    }
  });

  if (changeElements.length === 0) {
    return <p className="text-slate-500">Edited listing</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {changeElements.map((element, index) => (
        <div key={index}>{element}</div>
      ))}
    </div>
  );
}
