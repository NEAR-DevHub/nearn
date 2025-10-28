import { ArrowRight, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { MdOutlineAccountBalanceWallet, MdOutlineMail } from 'react-icons/md';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { KycComponent } from '@/components/ui/KycComponent';
import { Tooltip } from '@/components/ui/tooltip';
import { tokenList } from '@/constants/tokenList';
import { useClipboard } from '@/hooks/use-clipboard';
import { getSubmissionUrl } from '@/utils/bounty-urls';
import { cn } from '@/utils/cn';
import { getURLSanitized } from '@/utils/getURLSanitized';
import { truncatePublicKey } from '@/utils/truncatePublicKey';
import { truncateString } from '@/utils/truncateString';

import { type Listing } from '@/features/listings/types';
import {
  Discord,
  GitHub,
  Linkedin,
  Telegram,
  Twitter,
  Website,
} from '@/features/social/components/SocialIcons';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';

interface Props {
  submission?: SubmissionWithListingUser;
  bounty?: Listing;
}

export function SubmissionTalent({ submission, bounty }: Props) {
  const { onCopy: onCopySubmissionLink } = useClipboard(
    getSubmissionUrl(submission, bounty),
  );

  const handleCopySubmissionLink = () => {
    if (submission?.id) {
      onCopySubmissionLink();
      toast.success('Submission link copied', {
        duration: 1500,
      });
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <EarnAvatar
        className="h-10 w-10"
        id={submission?.user?.id}
        avatar={submission?.user?.photo || undefined}
      />
      <div>
        <p className="flex w-full items-center whitespace-nowrap font-medium text-slate-900">
          {submission?.user?.name}
          <span className="text-slate-500">
            {`'s Submission #${submission?.sequentialId}`}
          </span>
          <Button
            variant="ghost"
            className="mb-1 ml-2 h-4 w-4 p-0 text-slate-500 hover:text-slate-500"
            onClick={handleCopySubmissionLink}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Link
            href={getURLSanitized(getSubmissionUrl(submission, bounty))}
            target="_blank"
          >
            <ExternalLink className="mb-1 ml-2 h-4 w-4 text-slate-500" />
          </Link>
        </p>
        <Link
          className="flex w-full items-center whitespace-nowrap text-xs font-medium text-slate-500"
          href={`/t/${submission?.user?.username}`}
        >
          View Profile <ArrowRight className="inline-block h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export function SubmissionSocialRow({ submission, bounty }: Props) {
  const { onCopy: onCopyEmail } = useClipboard(submission?.user?.email || '');

  const { onCopy: onCopyPublicKey } = useClipboard(
    submission?.user?.publicKey || '',
  );

  const handleCopyEmail = () => {
    if (submission?.user?.email) {
      onCopyEmail();
      toast.success('Email copied', {
        duration: 1500,
      });
    }
  };

  const handleCopyPublicKey = () => {
    if (submission?.user?.publicKey) {
      onCopyPublicKey();
      toast.success('Wallet address copied', {
        duration: 1500,
      });
    }
  };

  const isUsdBased = bounty?.token === 'Any';
  const tokenName = isUsdBased ? submission?.token : bounty?.token;
  const token = tokenList.find((s) => s.tokenSymbol === tokenName);

  let amount = bounty?.compensationType === 'fixed' ? 0 : submission?.ask;
  if (submission?.isWinner && submission?.winnerPosition) {
    amount = bounty?.rewards?.[submission?.winnerPosition] ?? 0;
  }

  const socials = [
    {
      icon: (
        <Telegram
          key="telegram"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.telegram || ''}
        />
      ),
      isVisible: !!submission?.user?.telegram,
    },
    {
      icon: (
        <Twitter
          key="twitter"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.twitter || ''}
        />
      ),
      isVisible: !!submission?.user?.twitter,
    },
    {
      icon: (
        <Discord
          key="discord"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.discord || ''}
        />
      ),
      isVisible: !!submission?.user?.discord,
    },
    {
      icon: (
        <Linkedin
          key="linkedin"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.linkedin || ''}
        />
      ),
      isVisible: !!submission?.user?.linkedin,
    },
    {
      icon: (
        <GitHub
          key="github"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.github || ''}
        />
      ),
      isVisible: !!submission?.user?.github,
    },
    {
      icon: (
        <Website
          key="website"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.website || ''}
        />
      ),
      isVisible: !!submission?.user?.website,
    },
  ];
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex gap-5">
        {!!amount && amount > 0 && (
          <div className="flex items-start text-sm font-medium text-slate-950">
            <img
              src={token?.icon}
              alt={token?.tokenSymbol}
              className="h-4 w-4 rounded-full"
            />
            <span className="ml-1">
              {isUsdBased && '$'}
              {amount.toLocaleString('en-us')}
              <span className="text-slate-400">
                {isUsdBased && ' to be paid in'}
              </span>
              <span
                className={cn(
                  'ml-1',
                  !isUsdBased && 'font-semibold text-slate-400',
                )}
              >
                {token?.tokenSymbol}
              </span>
            </span>
          </div>
        )}

        {submission?.user?.publicKey && (
          <div className="flex items-center gap-1">
            <Tooltip
              content={'Click to copy'}
              contentProps={{ side: 'right' }}
              triggerClassName="flex items-center hover:underline underline-offset-1"
            >
              <div
                className="flex cursor-pointer items-center justify-start gap-1 whitespace-nowrap text-sm text-slate-400 hover:text-slate-500"
                onClick={handleCopyPublicKey}
                role="button"
                tabIndex={0}
                aria-label={`Copy public key: ${truncatePublicKey(submission.user.publicKey, 20)}`}
              >
                <MdOutlineAccountBalanceWallet />
                <p>{truncatePublicKey(submission.user.publicKey, 20)}</p>
              </div>
            </Tooltip>
            <div className="mb-0.5">
              <KycComponent
                address={submission?.user?.publicKey}
                imageOnly
                listingSponsorId={bounty?.sponsorId}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-5">
        {submission?.user?.email && (
          <Tooltip
            content={'Click to copy'}
            contentProps={{ side: 'right' }}
            triggerClassName="flex items-center hover:underline underline-offset-1"
          >
            <div
              className="flex cursor-pointer items-center justify-start gap-1 text-sm text-slate-400 hover:text-slate-500"
              onClick={handleCopyEmail}
              role="button"
              tabIndex={0}
              aria-label={`Copy email: ${submission.user.email}`}
            >
              <MdOutlineMail />
              {truncateString(submission.user.email, 36)}
            </div>
          </Tooltip>
        )}

        <div className="flex gap-2">
          {socials
            .filter((social) => social.isVisible)
            .map((social) => (
              <Fragment key={social.icon.key}>{social.icon}</Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}
