import { useQuery } from '@tanstack/react-query';
import { Loader, TriangleAlert } from 'lucide-react';
import Image from 'next/image';

import { KYC_SPONSOR_WHITELIST } from '@/constants/kyc';
import { cn } from '@/utils/cn';

import {
  checkKycQuery,
  type KycResponse,
} from '@/features/listings/queries/check-kyc';

import { VerifiedBadge } from '../shared/VerifiedBadge';
import { Tooltip as TooltipUI } from './tooltip';

export const FIREHOSE_ID = '68ef6576-d931-4405-82c4-6a8574ee0b3f';
export const INFRA_COMMITTEE_ID = 'c3b689b9-2551-4dda-8e8c-68037c25477c';
export const NF_FS = 'dfa80621-1840-47c7-8214-191573c97629';

const CUSTOM_KYC_TEXT = {
  [FIREHOSE_ID]: `If your submission is selected for a prize, you'll need to complete identity verification (KYC/KYB) before any award can be issued. Our team will contact winning participants via email with instructions after winners are announced.`,
  [NF_FS]: `If your submission is selected for a prize, you'll need to complete identity verification (KYC/KYB) before any award can be issued. Our team will contact winning participants via email with instructions after winners are announced.`,
  [INFRA_COMMITTEE_ID]: `If your submission is approved, you'll need to complete identity verification (KYC/KYB) before any award can be issued. Our team will contact approved recipients via email with instructions.`,
};

interface KycComponentProps {
  address: string | undefined;
  imageOnly?: boolean;
  variant?: 'default' | 'xs' | 'extended';
  listingSponsorId?: string;
  hideCustom?: boolean;
}

function styleKycStatus(kycData?: KycResponse) {
  if (!kycData)
    return {
      className: 'text-gray-500',
      text: 'KYC / KYB Status loading...',
      image: <Loader className="h-4 w-4 animate-spin" />,
    };
  switch (kycData.kyc_status) {
    case 'APPROVED':
      return {
        className: 'text-green-600',
        text: 'KYC / KYB Verified',
        image: <VerifiedBadge className={cn('fill-green-600')} />,
      };
    case 'PENDING':
      return {
        className: 'text-yellow-500',
        text: 'KYC / KYB Verification in Progress',
        image: (
          <Image
            src="/assets/kyc-verify-in-progress.svg"
            alt="KYC / KYB status"
            width={0}
            height={0}
            className={'h-4 w-4 fill-yellow-500'}
          />
        ),
      };
    case 'NOT_SUBMITTED':
      return {
        className: 'text-red-500',
        text: 'KYC / KYB Not Verified',
        image: (
          <Image
            src="/assets/kyc-failed.svg"
            alt="KYC / KYB status"
            width={0}
            height={0}
            className={'h-4 w-4 fill-red-500'}
          />
        ),
      };
    case 'REJECTED':
      return {
        className: 'text-red-500',
        text: 'KYC / KYB Verification Rejected',
        image: (
          <Image
            src="/assets/kyc-failed.svg"
            alt="KYC / KYB status"
            width={0}
            height={0}
            className={'h-4 w-4 fill-red-500'}
          />
        ),
      };
    case 'EXPIRED':
      return {
        className: 'text-gray-500',
        text: 'KYC / KYB Verification Expired',
        image: (
          <Image
            src="/assets/kyc-failed.svg"
            alt="KYC / KYB status"
            width={0}
            height={0}
            className={'h-4 w-4 fill-gray-500'}
          />
        ),
      };
    default:
      return {
        className: 'text-gray-500',
        text: 'Unknown KYC / KYB status',
        image: (
          <Image
            src="/assets/kyc-failed.svg"
            alt="KYC / KYB status"
            width={0}
            height={0}
            className={'h-4 w-4 fill-gray-500'}
          />
        ),
      };
  }
}

export function isKYCEnabled(listingSponsorId?: string) {
  return !!listingSponsorId && KYC_SPONSOR_WHITELIST.includes(listingSponsorId);
}

export function KycComponent({
  address,
  imageOnly = false,
  variant = 'default',
  listingSponsorId,
  hideCustom = false,
}: KycComponentProps) {
  const isKycEnabled = isKYCEnabled(listingSponsorId);

  const { data: kycData } = useQuery({
    enabled: !!address && isKycEnabled,
    ...checkKycQuery(address!),
  });

  if (!isKycEnabled) {
    return null;
  }

  const { className, text, image } = styleKycStatus(kycData);
  const isCustom =
    listingSponsorId &&
    !!CUSTOM_KYC_TEXT[listingSponsorId as keyof typeof CUSTOM_KYC_TEXT];

  if (isCustom && hideCustom) {
    return null;
  }

  if (variant === 'extended') {
    return (
      <div className="pl-2 text-[0.85rem] text-red-700">
        <div className="flex items-center gap-2 font-bold">
          <TriangleAlert className="h-4 w-4" />
          Important Note:
        </div>
        <p className="ml-6">
          If your submission is approved, you&apos;ll need to complete identity
          verification (KYC/KYB) before any award can be issued. Our team will
          contact approved recipients via email with instructions.
        </p>
      </div>
    );
  }

  const content = imageOnly ? (
    <TooltipUI content={text} contentProps={{ className }}>
      {image}
    </TooltipUI>
  ) : (
    <>
      {image}
      <p className={cn('text-sm font-medium', variant === 'xs' && 'text-xs')}>
        {text}
      </p>
    </>
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>{content}</div>
  );
}
