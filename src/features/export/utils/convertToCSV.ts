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

  // Group submissions by listing ID
  const submissionsByListing = submissions.reduce(
    (acc, submission) => {
      const listingId = submission.listing.sequentialId;
      if (listingId !== undefined) {
        if (!acc[listingId]) {
          acc[listingId] = [];
        }
        acc[listingId].push(submission);
      }
      return acc;
    },
    {} as Record<number, SubmissionWithListingUser[]>,
  );

  const prepareAnswersColumns = (
    submission: SubmissionWithListingUser,
    questions: string[],
  ) => {
    const eligibilityAnswers = submission.eligibilityAnswers ?? [];
    const submissionAnswers: Record<string, string> = {};

    // Add custom questions with full question text as column title
    eligibilityAnswers.forEach(
      (answer: { question: string; answer: string }) => {
        const questionTitle = stripHtml(answer.question);
        submissionAnswers[questionTitle] = stripHtml(answer.answer);
      },
    );

    const allPossibleQuestions: Record<string, string> = {};
    questions.forEach((question) => {
      const strippedQuestion = stripHtml(question);
      allPossibleQuestions[strippedQuestion] =
        submissionAnswers[strippedQuestion] ?? '';
    });

    return allPossibleQuestions;
  };

  const csvParts: string[] = [];

  // Process each listing group
  Object.entries(submissionsByListing).forEach(
    ([_, listingSubmissions], index) => {
      // Add listing header
      const firstSubmission = listingSubmissions[0];
      if (!firstSubmission) return;

      const listingTypeWithUppercaseFirstLetter = firstSubmission.listing.type
        ? `${firstSubmission.listing.type.charAt(0).toUpperCase()}${firstSubmission.listing.type?.slice(1)}`
        : '';

      // Collect a stable, unique set of eligibility question titles for this listing
      const uniqueQuestionsForListing = Array.from(
        new Set(
          listingSubmissions.flatMap((submission) =>
            (submission.eligibilityAnswers ?? []).map(
              (answer: { question: string; answer: string }) =>
                stripHtml(answer.question),
            ),
          ),
        ),
      );

      // Process submissions for this listing
      const listingRows = listingSubmissions.map((submission) => {
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
        const accountAge = dayjs().diff(
          dayjs(submission.user.createdAt),
          'day',
        );
        const customAnswers = prepareAnswersColumns(
          submission,
          uniqueQuestionsForListing,
        );

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
              ? dayjs(submission.paymentDate)
                  .utc()
                  .format('YYYY-MM-DD HH:mm UTC')
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

      // Convert submission rows to CSV with headers
      if (listingRows.length > 0) {
        const submissionsCsv = Papa.unparse(listingRows, { header: true });
        csvParts.push(submissionsCsv);
      }

      // Add empty line between listings (except for the last one)
      if (index < Object.entries(submissionsByListing).length - 1) {
        csvParts.push('');
        csvParts.push('');
      }
    },
  );

  // Join all parts with newlines
  const csv = csvParts.join('\n');
  return csv;
}
