import { useAtom } from 'jotai';
import { X } from 'lucide-react';
import React, {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItemWithoutIndicator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDisclosure } from '@/hooks/use-disclosure';
import { type SubmissionWithUser } from '@/interface/submission';
import { cn } from '@/utils/cn';
import { formatNumberWithSuffix } from '@/utils/formatNumberWithSuffix';
import { cleanRewards, nthLabelGenerator, sortRank } from '@/utils/rank';

import { BONUS_REWARD_POSITION } from '@/features/listing-builder/constants';
import { type Listing } from '@/features/listings/types';

import { selectedSubmissionAtom } from '../../atoms';
import { useRejectSubmissions } from '../../mutations/useRejectSubmissions';
import { useToggleWinner } from '../../mutations/useToggleWinner';
import { RejectSubmissionModal } from './Modals/RejectModal';

interface Props {
  bounty: Listing | undefined;
  submissions: SubmissionWithUser[];
  usedPositions: number[];
  isHackathonPage?: boolean;
  setRemainings: Dispatch<
    SetStateAction<{ podiums: number; bonus: number } | null>
  >;
  onWinnersAnnounceOpen: () => void;
  isMultiSelectOn: boolean;
}

export const SelectWinner = ({
  bounty,
  submissions,
  usedPositions,
  setRemainings,
  isHackathonPage,
  onWinnersAnnounceOpen,
  isMultiSelectOn,
}: Props) => {
  const rewards = sortRank(cleanRewards(bounty?.rewards));

  const [selectedSubmission] = useAtom(selectedSubmissionAtom);
  const [unselect, setUnselect] = useState(false);

  const isProject = bounty?.type === 'project';
  const isSponsorship = bounty?.type === 'sponsorship';

  const isPending = selectedSubmission?.status === 'Pending';

  const {
    isOpen: rejectedIsOpen,
    onOpen: rejectedOnOpen,
    onClose: rejectedOnClose,
  } = useDisclosure();

  const { mutateAsync: toggleWinner } = useToggleWinner(
    bounty,
    submissions,
    setRemainings,
    usedPositions,
  );

  const rejectSubmissions = useRejectSubmissions(bounty?.slug || '');

  const handleRejectSubmission = (submissionIds: string) => {
    rejectSubmissions.mutate([submissionIds]);
    rejectedOnClose();
  };

  useEffect(() => {
    if (unselect) {
      setTimeout(() => {
        selectWinner(0, selectedSubmission?.id);
        setUnselect(false);
      }, 100);
    }
  }, [unselect]);

  const rewardsLength =
    rewards.length - ((bounty?.maxBonusSpots ?? 0) > 0 ? 1 : 0);
  const usedBonusPositions =
    usedPositions.filter((u) => u === BONUS_REWARD_POSITION).length -
    (selectedSubmission?.winnerPosition === BONUS_REWARD_POSITION ? 1 : 0);
  const usedRewards = usedPositions.filter((u) => u !== BONUS_REWARD_POSITION);

  const selectWinner = async (position: number, id: string | undefined) => {
    if (!id) return;
    toggleWinner({
      id,
      isWinner: !!position,
      winnerPosition: position || null,
    });
  };

  const filteredWinnersSlots = rewards
    .filter((reward) => reward !== BONUS_REWARD_POSITION)
    .filter(
      (reward) =>
        !usedRewards.includes(reward) ||
        selectedSubmission?.winnerPosition === reward,
    );
  const filteredWinnersSlotsLength = filteredWinnersSlots.length;

  return (
    <>
      <div>
        {isProject || isSponsorship ? (
          <div className="ph-no-capture flex w-fit items-center justify-end gap-2">
            {isPending && (
              <>
                <Button
                  variant="destructive"
                  className="bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  disabled={isMultiSelectOn}
                  onClick={rejectedOnOpen}
                >
                  <div className="mr-2 rounded-full bg-red-600 p-[5px]">
                    <X className="h-2 w-2 text-white" />
                  </div>
                  Reject
                </Button>
                <Button
                  disabled={isMultiSelectOn}
                  onClick={onWinnersAnnounceOpen}
                >
                  {isSponsorship ? 'Approve Submission' : 'Announce As Winner'}
                </Button>
              </>
            )}
          </div>
        ) : (
          <Select
            disabled={!!bounty?.isWinnersAnnounced || isHackathonPage}
            onValueChange={(value) => {
              selectWinner(Number(value), selectedSubmission?.id);
            }}
            value={
              selectedSubmission?.isWinner
                ? selectedSubmission.winnerPosition?.toString() || ''
                : ''
            }
          >
            <SelectTrigger
              className={cn(
                'h-10 w-44 border-slate-300 font-medium capitalize text-slate-700',
                'focus:border-brand-green focus:ring-black',
              )}
            >
              {selectedSubmission?.isWinner &&
              selectedSubmission.winnerPosition ? (
                <p className="text-slate-500">
                  {nthLabelGenerator(
                    Number(selectedSubmission.winnerPosition),
                    false,
                  )}{' '}
                  |{' '}
                  {formatNumberWithSuffix(
                    bounty?.rewards?.[selectedSubmission.winnerPosition]!,
                    2,
                    true,
                  )}{' '}
                  {bounty?.token}
                </p>
              ) : (
                <SelectValue
                  className="placeholder:text-slate-800"
                  placeholder="Select Winner"
                />
              )}
            </SelectTrigger>
            <SelectContent
              className="flex flex-col gap-2 py-1.5"
              style={{ maxHeight: 'none', overflow: 'visible' }}
            >
              <p className="p-1.5 pt-1 text-xs font-medium text-slate-400">
                REWARDS
              </p>

              <div className="border-t border-slate-200">
                {filteredWinnersSlotsLength > 0 && (
                  <>
                    {' '}
                    <p className="px-1.5 pb-1 pt-2 text-xs text-slate-400">
                      {usedRewards.length}/{rewardsLength} Winner
                      {filteredWinnersSlotsLength > 1 ? 's' : ''} assigned
                    </p>
                    {filteredWinnersSlots.map((reward) => {
                      return (
                        <SelectItemWithoutIndicator
                          className="relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm p-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-50 focus:bg-slate-50 [&[data-state=checked]]:bg-slate-100"
                          key={reward}
                          value={reward.toString()}
                          onMouseDown={() => {
                            if (selectedSubmission?.winnerPosition === reward) {
                              setUnselect(true);
                            }
                          }}
                        >
                          <span className="text-slate-600">
                            {nthLabelGenerator(Number(reward), true)}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-900">
                            <span>
                              {formatNumberWithSuffix(
                                bounty?.rewards?.[reward]!,
                                2,
                                true,
                              )}
                            </span>
                            <span className="text-slate-500">
                              {bounty?.token}
                            </span>
                          </span>
                        </SelectItemWithoutIndicator>
                      );
                    })}
                  </>
                )}

                {usedBonusPositions < (bounty?.maxBonusSpots ?? 0) && (
                  <div className="border-t border-slate-200">
                    <p className="px-1.5 pb-1 pt-2 text-xs text-slate-400">
                      {usedBonusPositions}/{bounty?.maxBonusSpots!} Bonus
                      {bounty?.maxBonusSpots! > 1 ? 'es' : ''} assigned
                    </p>
                    <SelectItemWithoutIndicator
                      className="relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm p-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-50 focus:bg-slate-50"
                      key={BONUS_REWARD_POSITION}
                      value={String(BONUS_REWARD_POSITION)}
                      onMouseDown={() => {
                        if (
                          selectedSubmission?.winnerPosition ===
                          BONUS_REWARD_POSITION
                        ) {
                          setUnselect(true);
                        }
                      }}
                    >
                      <span className="text-slate-600">
                        {nthLabelGenerator(rewardsLength + 1, true)} -{' '}
                        {nthLabelGenerator(
                          rewardsLength + (bounty?.maxBonusSpots ?? 0),
                          true,
                        )}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <span>
                          {formatNumberWithSuffix(
                            bounty?.rewards?.[BONUS_REWARD_POSITION]!,
                            2,
                            true,
                          )}
                        </span>
                        <span className="text-slate-500">{bounty?.token}</span>
                      </span>
                    </SelectItemWithoutIndicator>
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>
      <RejectSubmissionModal
        onRejectSubmission={handleRejectSubmission}
        rejectIsOpen={rejectedIsOpen}
        submissionId={selectedSubmission?.id}
        applicantName={selectedSubmission?.user.name}
        rejectOnClose={rejectedOnClose}
      />
    </>
  );
};
