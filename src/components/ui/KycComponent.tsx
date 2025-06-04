import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import Image from 'next/image';

import { KYB_LINK, KYC_LINK, KYC_SPONSOR_WHITELIST } from '@/constants/kyc';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import {
  checkKycQuery,
  type KycResponse,
} from '@/features/listings/queries/check-kyc';

import { VerifiedBadge } from '../shared/VerifiedBadge';

interface KycComponentProps {
  address: string | undefined;
  imageOnly?: boolean;
  xs?: boolean;
  listingSponsorId?: string;
}

function styleKycStatus(kycData?: KycResponse) {
  if (!kycData)
    return {
      className: 'text-gray-500',
      text: 'KYC / KYB Status loading...',
      image: <Loader className="h-3 w-3 animate-spin" />,
      showAction: false,
    };
  switch (kycData.kyc_status) {
    case 'APPROVED':
      return {
        className: 'text-green-600',
        text: 'KYC / KYB Verified',
        image: <VerifiedBadge className={cn('fill-green-600')} />,
        showAction: false,
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
            className={'h-3 w-3 fill-yellow-500'}
          />
        ),
        showAction: false,
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
            className={'h-3 w-3 fill-red-500'}
          />
        ),
        showAction: true,
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
            className={'h-3 w-3 fill-red-500'}
          />
        ),
        showAction: true,
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
            className={'h-3 w-3 fill-gray-500'}
          />
        ),
        showAction: true,
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
            className={'h-3 w-3 fill-gray-500'}
          />
        ),
        showAction: true,
      };
  }
}

export function KycComponent({
  address,
  imageOnly = false,
  xs = false,
  listingSponsorId,
}: KycComponentProps) {
  const { user } = useUser();

  const { data: kycData } = useQuery({
    enabled: !!address,
    ...checkKycQuery(address!),
  });

  const sponsorIdToCheck = listingSponsorId || user?.currentSponsorId;

  if (!sponsorIdToCheck || !KYC_SPONSOR_WHITELIST.includes(sponsorIdToCheck)) {
    return null;
  }

  const { className, text, image, showAction } = styleKycStatus(kycData);

  const content = imageOnly ? (
    showAction ? (
      <a href={KYC_LINK} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    ) : (
      image
    )
  ) : (
    <>
      {image}
      <p className={cn('text-sm font-medium', xs && 'text-xs')}>
        {text}
        {showAction && (
          <span className="ml-1 underline">
            <a href={KYC_LINK} target="_blank" rel="noopener noreferrer">
              KYC
            </a>{' '}
            |
            <a
              href={KYB_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1"
            >
              KYB
            </a>
          </span>
        )}
      </p>
    </>
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>{content}</div>
  );
}
