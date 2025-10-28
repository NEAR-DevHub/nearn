import { type SubmissionWithUser } from '@/interface/submission';
import { cn } from '@/utils/cn';

interface MilestoneCompletionLineProps {
  submission: SubmissionWithUser;
  hideText?: boolean;
}

const colorMap = {
  Paid: 'bg-emerald-700',
  Cancelled: 'bg-red-600',
};

export default function MilestoneCompletionLine({
  submission,
  hideText = false,
}: MilestoneCompletionLineProps) {
  const completedMilestones = submission.Milestones.filter(
    (milestone) =>
      milestone.status === 'Paid' || milestone.status === 'Cancelled',
  );

  return (
    <div className="flex w-full min-w-[160px] flex-col gap-0.5">
      {!hideText && (
        <p className="text-center text-xs font-semibold text-slate-600">
          {completedMilestones.length}/{submission.Milestones.length} Milestones
          Completed
        </p>
      )}
      <div className="flex gap-[1px]">
        {submission.Milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              'h-2 flex-1 rounded-l-[2px] rounded-r-[2px] bg-slate-200 first:rounded-l-full last:rounded-r-full',
              colorMap[milestone.status as keyof typeof colorMap],
            )}
          />
        ))}
      </div>
    </div>
  );
}
