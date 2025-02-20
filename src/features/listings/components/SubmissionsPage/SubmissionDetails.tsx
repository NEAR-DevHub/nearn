import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MdOutlineAccountBalanceWallet, MdOutlineMail } from 'react-icons/md';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useClipboard } from '@/hooks/use-clipboard';

import type { SubmissionWithUser } from '@/interface/submission';
import type { Listing } from '@/features/listings/types';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';
import { truncatePublicKey } from '@/utils/truncatePublicKey';
import { truncateString } from '@/utils/truncateString';
import { formatNumberWithSuffix } from '@/utils/formatNumberWithSuffix';
import {
  Telegram,
  Twitter,
  Website,
} from '@/features/social/components/SocialIcons';
import { Details } from '@/features/sponsor-dashboard/components/Submissions/Details';

interface SubmissionDetailsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  submission: SubmissionWithUser;
  bounty: Listing;
}

export const SubmissionDetails = ({
  open,
  setOpen,
  submission,
  bounty,
}: SubmissionDetailsProps) => {
  const isMD = useBreakpoint('md');

  const { onCopy: onCopyEmail } = useClipboard(
    submission?.user?.email || '',
  );

  const { onCopy: onCopyPublicKey } = useClipboard(
    submission?.user?.publicKey || '',
  );

  const handleCopyEmail = () => {
    if (submission?.user?.email) {
      onCopyEmail();
      toast.success('Email copied to clipboard', {
        duration: 1500,
      });
    }
  };

  const handleCopyPublicKey = () => {
    if (submission?.user?.publicKey) {
      onCopyPublicKey();
      toast.success('Wallet address copied to clipboard', {
        duration: 1500,
      });
    }
  };

  const Content = () => (
    <>
      <div className="rounded-t-xl border-b border-slate-200 bg-white py-1">
        <div className="flex w-full items-center justify-between px-4 pt-3">
          <div className="flex w-full items-center gap-2">
            <EarnAvatar
              className="h-10 w-10"
              id={submission?.user?.id}
              avatar={submission?.user?.photo || undefined}
            />
            <div>
              <p className="w-full whitespace-nowrap font-medium text-slate-900">
                {`${submission?.user?.firstName}'s Submission`}
              </p>
              <Link
                className="flex w-full items-center whitespace-nowrap text-xs font-medium text-brand-purple"
                href={`/t/${submission?.user?.username}`}
              >
                View Profile <ArrowRight className="inline-block h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="ph-no-capture flex w-full items-center justify-end gap-2">
            {submission?.isWinner &&
              submission?.winnerPosition &&
              submission?.isPaid && (
                <Button
                  className="mr-4 text-slate-600"
                  onClick={() => {
                    window.open(
                      `https://nearblocks.io/txns/${submission?.paymentDetails?.txId}`,
                      '_blank',
                    );
                  }}
                  size="default"
                  variant="ghost"
                >
                  View Payment Tx
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
          </div>
        </div>

        <div className="flex items-center gap-5 px-5 py-2">
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

          {submission?.user?.publicKey && (
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
                aria-label={`Copy public key: ${truncatePublicKey(submission.user.publicKey, 3)}`}
              >
                <MdOutlineAccountBalanceWallet />
                <p>{truncatePublicKey(submission.user.publicKey, 3)}</p>
              </div>
            </Tooltip>
          )}
          <div className="flex gap-2">
            <Telegram
              className="h-[0.9rem] w-[0.9rem] text-slate-600"
              link={submission?.user?.telegram || ''}
            />
            <Twitter
              className="h-[0.9rem] w-[0.9rem] text-slate-600"
              link={submission?.user?.twitter || ''}
            />
            <Website
              className="h-[0.9rem] w-[0.9rem] text-slate-600"
              link={submission?.user?.website || ''}
            />
          </div>
          {(bounty?.type === 'project' || bounty?.type === 'sponsorship') && (
            <p className="whitespace-nowrap text-sm text-slate-400">
              ${formatNumberWithSuffix(submission?.totalEarnings || 0)} Earned
            </p>
          )}

        </div>
        <div className="flex w-full border-t border-slate-200">
          <Details bounty={bounty} border={false} center={true} modalView={true} />
        </div>
      </div>
    </>
  );

  if (!isMD)
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="!border-0 !ring-0">
          <DrawerHeader className="text-left">
            <Content />
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-[50rem] overflow-hidden"
      >
        <DialogHeader>
          <Content />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
