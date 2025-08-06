import dayjs from 'dayjs';
import Papa from 'papaparse';

import { isKYCEnabled } from '@/components/ui/KycComponent';
import { getBountyUrl, getSubmissionUrl } from '@/utils/bounty-urls';
import { getURLSanitized } from '@/utils/getURLSanitized';
import { getURL } from '@/utils/validUrl';

import { BONUS_REWARD_POSITION } from '@/features/listing-builder/constants';
import { fetchKyc } from '@/features/listings/queries/check-kyc';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

// Strip HTML tags and decode HTML entities
function stripHtml(html: string): string {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  return text;
}

/// This function first converts submissions to Map<Address, Submission>
/// Then it fetches KYC status for each address
/// Then it returns a Map<Address, KYCStatus>
async function prepareKycStatus(submissions: SubmissionWithListingUser[]) {
  const submissionsMap = new Map<string, SubmissionWithListingUser>();
  submissions.forEach((submission) => {
    if (submission.user.publicKey) {
      submissionsMap.set(submission.user.publicKey, submission);
    }
  });

  const kycStatuses = await Promise.all(
    Array.from(submissionsMap.keys()).map(fetchKyc),
  );
  const kycStatusesMap = new Map<string, string>();
  kycStatuses.forEach((kyc) => {
    kycStatusesMap.set(kyc.account_id, kyc.kyc_status);
  });

  return kycStatusesMap;
}

export async function convertToCSV(
  sponsorId: string,
  submissions: SubmissionWithListingUser[],
) {
  const isKycEnabled = isKYCEnabled(sponsorId);
  const kycStatuses = isKycEnabled
    ? await prepareKycStatus(submissions)
    : new Map<string, string>();
  const findLargestEligibilityAnswerLength = submissions.reduce(
    (maxLength, submission) => {
      const eligibilityAnswers = submission.eligibilityAnswers ?? [];
      return Math.max(maxLength, eligibilityAnswers.length);
    },
    0,
  );

  const prepareAnswersColumns = (submission: SubmissionWithListingUser) => {
    const eligibilityAnswers = submission.eligibilityAnswers ?? [];
    const answersObj: Record<string, string> = {};

    // Add questions and answers with numbered format, stripping HTML
    eligibilityAnswers.forEach(
      (answer: { question: string; answer: string }, index: number) => {
        answersObj[`Question ${index + 1}`] = stripHtml(answer.question);
        answersObj[`Answer ${index + 1}`] = stripHtml(answer.answer);
      },
    );

    // Fill empty columns for consistency
    for (
      let i = eligibilityAnswers.length;
      i < findLargestEligibilityAnswerLength;
      i++
    ) {
      answersObj[`Question ${i + 1}`] = '';
      answersObj[`Answer ${i + 1}`] = '';
    }

    return answersObj;
  };

  const exportMapped = submissions.map((submission) => {
    const isUSDBased = submission.listing.token === 'Any';
    const token = isUSDBased ? submission.token : submission.listing.token;
    const amount =
      submission.isWinner && submission.winnerPosition
        ? submission.listing?.rewards?.[submission.winnerPosition]
        : 0;
    const displayAmount =
      !amount || amount <= 0
        ? ''
        : isUSDBased
          ? amount?.toLocaleString('en-US')
          : `${amount}`;
    const accountAge = dayjs(dayjs()).diff(
      dayjs(submission.user.createdAt),
      'day',
    );
    const customAnswers = prepareAnswersColumns(submission);
    const listingTypeWithUppercaseFirstLetter = submission.listing.type
      ? `${submission.listing.type.charAt(0).toUpperCase()}${submission.listing.type?.slice(1)}`
      : '';

    return {
      'Listing Type': listingTypeWithUppercaseFirstLetter,
      'Listing Name': submission.listing.title,
      'Listing Link': getBountyUrl(submission.listing),
      'Listing ID': submission.listing.sequentialId,
      'Submission Link': getSubmissionUrl(submission, submission.listing),
      'Submission ID': submission.sequentialId,
      'Contributor Name': submission.user.name,
      'Profile Link': `${getURL()}/t/${submission.user.username}`,
      'Email (From Profile)': submission.user.email,
      'User Wallet (From Profile)': submission.user.publicKey,
      ...(isKycEnabled && {
        'KYC Status': submission.user.publicKey
          ? (kycStatuses.get(submission.user.publicKey) ?? 'Unknown')
          : 'Unknown',
      }),
      'Account Age': `${accountAge} day${accountAge > 1 ? 's' : ''}`,
      'Twitter Handle': submission.user.twitter ?? '',
      'Submission Created At': dayjs(submission.createdAt)
        .utc()
        .format('YYYY-MM-DD HH:mm UTC'),
      'Winner Position': submission.isWinner
        ? submission.winnerPosition === BONUS_REWARD_POSITION
          ? 'Bonus'
          : submission.winnerPosition
        : '',
      'Approved By': submission.approvedByUser
        ? submission.approvedByUser.name
        : '',
      'Approved Date': submission.approveDate
        ? dayjs(submission.approveDate).utc().format('YYYY-MM-DD HH:mm UTC')
        : '',
      'Payment Status': submission.isWinner
        ? submission.isPaid
          ? 'Paid'
          : 'Unpaid'
        : '',
      'Payment Date':
        submission.isPaid && submission.paymentDate
          ? dayjs(submission.paymentDate).utc().format('YYYY-MM-DD HH:mm UTC')
          : '',
      'Payment Link': submission.paymentDetails?.link ?? '',
      'Paid By': submission.paidByUser ? submission.paidByUser.name : '',
      'Requested in USD': isUSDBased ? displayAmount : '',
      'Requested in Token': isUSDBased ? '' : displayAmount,
      Token: token,
      'Tweet Link (Default Bounty Question)': getURLSanitized(
        submission.tweet ?? '',
      ),
      'Link to Submission (Default Bounty Question)': getURLSanitized(
        submission.link ?? '',
      ),
      Notes: submission.notes ?? '',
      ...customAnswers,
    };
  });

  // Convert to CSV using Papa Parse
  const csv = Papa.unparse(exportMapped);
  return csv;
}
