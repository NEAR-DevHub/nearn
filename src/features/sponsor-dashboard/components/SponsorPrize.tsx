import { ChevronDown } from 'lucide-react';
import React from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { tokenList } from '@/constants/tokenList';
import { formatNumberWithSuffix } from '@/utils/formatNumberWithSuffix';
import { nthLabelGenerator } from '@/utils/rank';

import { type Listing } from '@/features/listings/types';

const TotalRewardWithIcon = ({ bounty }: { bounty: Listing }) => {
  return (
    <div className="flex items-start gap-1">
      <img
        className="h-5 w-5 rounded-full"
        alt={'green dollar'}
        src={
          tokenList.filter((e) => e?.tokenSymbol === bounty?.token)[0]?.icon ??
          '/assets/dollar.svg'
        }
      />
      <p className="font-semibold text-slate-600">
        {(() => {
          switch (bounty?.compensationType) {
            case 'fixed':
              return (
                <>{formatNumberWithSuffix(bounty?.rewardAmount!, 2, true)}</>
              );
            case 'range':
              return (
                <>
                  {`${formatNumberWithSuffix(bounty?.minRewardAsk!, 2, true)}-${formatNumberWithSuffix(bounty?.maxRewardAsk!, 2, true)}`}
                </>
              );
            case 'variable':
              return <>Variable</>;
            default:
              return null;
          }
        })()}
      </p>
      <p className="font-semibold text-slate-500">{bounty?.token}</p>
    </div>
  );
};

export const SponsorPrize = ({
  bounty,
  smallView = false,
}: {
  bounty: Listing | undefined;
  smallView?: boolean;
}) => {
  if (!bounty) return null;
  const values = Object.entries(bounty?.rewards ?? {});
  const rewardsLength = values.length;
  const isSponsorship = bounty.type === 'sponsorship';
  const bonusSpots = bounty.maxBonusSpots ?? 0;
  const prizes = bonusSpots > 0 ? rewardsLength - 1 : rewardsLength;

  return (
    <Popover>
      <PopoverTrigger
        disabled={rewardsLength < 2 || isSponsorship || smallView}
        className="flex items-center justify-start gap-1"
      >
        <TotalRewardWithIcon bounty={bounty} />
        {rewardsLength > 1 && !isSponsorship && !smallView && (
          <>
            <p className="font-semibold text-slate-400">
              {prizes + bonusSpots} Prizes
            </p>
            <ChevronDown className="h-4 w-4 text-slate-500" strokeWidth={3} />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="flex w-56 shrink-0 flex-col gap-2 p-3">
        <p className="text-xs font-medium text-slate-400">REWARDS</p>
        <div>
          <div className="border-t border-slate-200 pb-1 pt-2 text-xs text-slate-400">
            {prizes} Winners
          </div>
          {values
            .filter(([key]) => key !== '99')
            .map(([key, value]) => {
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-1 py-1.5 font-sans text-sm"
                >
                  <p className="text-slate-600">
                    {nthLabelGenerator(Number(key), true)}
                  </p>
                  <p className="flex items-center gap-1 text-slate-900">
                    <span className="font-semibold">
                      {formatNumberWithSuffix(value, 2, true)}
                    </span>
                    <span className="font-semibold text-slate-500">
                      {bounty?.token}
                    </span>
                  </p>
                </div>
              );
            })}
          {bonusSpots && bonusSpots > 0 ? (
            <>
              <div className="border-t border-slate-200 pb-1 pt-2 text-xs text-slate-400">
                {bonusSpots} Bonus{bonusSpots > 1 ? 'es' : ''}
              </div>
              <div className="flex justify-between gap-1 py-1.5 text-sm">
                <p className="text-slate-600">
                  {nthLabelGenerator(prizes + 1, true)} -{' '}
                  {nthLabelGenerator(prizes + bonusSpots, true)}
                </p>
                <p className="flex shrink-0 items-center font-sans font-semibold text-slate-900">
                  {formatNumberWithSuffix(bounty?.rewards?.['99']!, 2, true)}
                  <span className="ml-1 text-slate-500">{bounty?.token}</span>
                </p>
              </div>
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};
