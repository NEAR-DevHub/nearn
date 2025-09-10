import { ExternalImage } from '@/components/ui/cloudinary-image';
import { LocalImage } from '@/components/ui/local-image';
import { tokenList } from '@/constants/tokenList';
import { cn } from '@/utils/cn';
import { nthLabelGenerator } from '@/utils/rank';

import { type Rewards } from '@/features/listings/types';

interface WinnerFeedImageProps {
  token: string | undefined;
  winnerPosition: keyof Rewards | undefined;
  rewards: Rewards | undefined;
  grantApplicationAmount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export const WinnerFeedImage = ({
  token,
  winnerPosition,
  rewards,
  grantApplicationAmount,
  className,
  size = 'lg',
  variant = 'default',
}: WinnerFeedImageProps) => {
  const sizeClasses = {
    sm: {
      container: 'h-[80px] md:h-[120px]',
      celebration: 'h-4 w-4 md:h-6 md:w-6',
      tokenIcon: 'h-4 w-4 md:h-6 md:w-6',
      amountText: 'text-sm md:text-base',
      badge: 'text-[10px] md:text-xs px-2 py-1',
      gap: 'gap-0.5 md:gap-1',
      marginTop: 'mt-1 md:mt-2',
      marginY: 'my-1 md:my-2',
    },
    md: {
      container: 'h-[140px] md:h-[250px]',
      celebration: 'h-6 w-6 md:h-14 md:w-14',
      tokenIcon: 'h-6 w-6 md:h-12 md:w-12',
      amountText: 'text-xl md:text-3xl',
      badge: 'text-xs md:text-sm px-3 py-1.5',
      gap: 'gap-1 md:gap-3',
      marginTop: 'mt-3',
      marginY: 'my-3',
    },
    lg: {
      container: 'h-[200px] md:h-[350px]',
      celebration: 'h-9 w-9 md:h-20 md:w-20',
      tokenIcon: 'h-8 w-8 md:h-16 md:w-16',
      amountText: 'text-2xl md:text-5xl',
      badge: 'text-xs md:text-lg px-4 py-2',
      gap: 'gap-1 md:gap-4',
      marginTop: 'mt-4',
      marginY: 'my-4',
    },
  };

  const currentSize = sizeClasses[size];

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-md border bg-[#7E51FF] p-2 md:p-3',
          className,
        )}
      >
        <div className="flex items-center gap-1.5 md:gap-2">
          <ExternalImage
            className={currentSize.celebration}
            alt="winner"
            src={'/icons/celebration.png'}
          />
          <LocalImage
            className={cn(currentSize.tokenIcon, 'rounded-full')}
            alt={`${token} icon`}
            src={tokenList.find((t) => t.tokenSymbol === token)?.icon || ''}
          />
          <p className={cn(currentSize.amountText, 'font-semibold text-white')}>
            {!!grantApplicationAmount ? (
              grantApplicationAmount
            ) : (
              <>
                {winnerPosition
                  ? `${rewards?.[Number(winnerPosition)]}`
                  : 'N/A'}
              </>
            )}{' '}
            {token === 'Any' ? 'USD' : token}
          </p>
        </div>
        <p
          className={cn(
            currentSize.badge,
            'rounded-full bg-[#5536ab8a] font-medium text-white',
          )}
        >
          {!!grantApplicationAmount ? (
            'GRANT'
          ) : (
            <>
              {nthLabelGenerator(Number(winnerPosition), false).toUpperCase()}{' '}
              PRIZE
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-center rounded-t-md border bg-[#7E51FF]',
        currentSize.container,
        className,
      )}
    >
      <ExternalImage
        className={cn('mx-auto', currentSize.celebration)}
        alt="winner"
        src={'/icons/celebration.png'}
      />
      <div
        className={cn(
          currentSize.marginTop,
          'flex w-full items-center justify-center',
          currentSize.gap,
        )}
      >
        <LocalImage
          className={cn(currentSize.tokenIcon, 'rounded-full')}
          alt={`${token} icon`}
          src={tokenList.find((t) => t.tokenSymbol === token)?.icon || ''}
        />
        <p className={cn(currentSize.amountText, 'font-semibold text-white')}>
          {!!grantApplicationAmount ? (
            grantApplicationAmount
          ) : (
            <>
              {winnerPosition ? `${rewards?.[Number(winnerPosition)]}` : 'N/A'}
            </>
          )}{' '}
          {token === 'Any' ? 'USD' : token}
        </p>
      </div>
      <p
        className={cn(
          'mx-auto w-fit rounded-full bg-[#5536ab8a] font-medium text-white',
          currentSize.badge,
          currentSize.marginY,
        )}
      >
        {!!grantApplicationAmount ? (
          'GRANT'
        ) : (
          <>
            {nthLabelGenerator(Number(winnerPosition), false).toUpperCase()}{' '}
            PRIZE
          </>
        )}
      </p>
    </div>
  );
};
