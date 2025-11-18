import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Copy, Loader2, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { type SponsorType } from '@/interface/sponsor';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { SocialInput } from '@/features/social/components/SocialInput';
import {
  isNearnIoRequestorQuery,
  isValidDaoPolicyQuery,
} from '@/features/sponsor-dashboard/queries/isNearnIoRequestor';

import {
  NEARN_NO_REQUESTOR_RIGHTS,
  nearTreasuryFormSchema,
  type NearTreasuryFormValues,
} from '../utils/integrationsFormSchema';

const formHelpfulUrl = (frontendUrl: string) => {
  let url;
  if (frontendUrl.includes('app.neartreasury.com')) {
    url = `${frontendUrl}/settings?tab=members&member=nearn-io.near&permissions=requestor`;
  } else {
    url = `${frontendUrl}/?page=settings&tab=members&member=nearn-io.near&permissions=requestor`;
  }
  return getURLSanitized(url);
};

interface Props {
  sponsorData: SponsorType;
  refetchUser: () => void;
  refetch: () => void;
}

export default function NearTreasuryIntegration({
  sponsorData,
  refetchUser,
  refetch,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disconnectModalOpen, setDisconnectModalOpen] =
    useState<boolean>(false);
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  const form = useForm<NearTreasuryFormValues>({
    resolver: zodResolver(nearTreasuryFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nearTreasuryFrontend: '',
    },
  });

  const { data: isRequestor, isLoading: isRequestorLoading } = useQuery(
    isNearnIoRequestorQuery(sponsorData?.nearTreasury?.dao),
  );

  const { data: isValidDaoPolicy, isLoading: isLoadingDaoPolicy } = useQuery(
    isValidDaoPolicyQuery(sponsorData?.nearTreasury?.dao),
  );

  const [frontendLinkTransformedError, setIsError] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const error = form.formState.errors.nearTreasuryFrontend;
    if (
      error?.type === 'custom' &&
      error.message?.includes(`[${NEARN_NO_REQUESTOR_RIGHTS}]`)
    ) {
      setIsError(error.message.split(`[${NEARN_NO_REQUESTOR_RIGHTS}]`)[1]);
    } else if (!!error) {
      setIsError(undefined);
    }
  }, [form.formState.errors.nearTreasuryFrontend, form.clearErrors]);

  useEffect(() => {
    if (sponsorData) {
      form.reset({
        nearTreasuryFrontend: sponsorData.nearTreasury?.frontend || '',
      });
    }
  }, [sponsorData, form.reset]);

  const onSubmit = async (data: NearTreasuryFormValues) => {
    try {
      setIsLoading(true);
      await axios.post('/api/sponsors/connect-near-treasury', {
        nearTreasuryFrontend:
          data.nearTreasuryFrontend === '' ? null : data.nearTreasuryFrontend,
      });
      await refetchUser();
      await refetch();
      toast.success('Integrations updated successfully!');
      setConnectModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error updating integrations:', error);
      toast.error('Failed to update integrations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showForm =
    !sponsorData.nearTreasury?.frontend ||
    sponsorData.nearTreasury?.frontend === '';

  return showForm ? (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/NEARTreasuryLogo.svg"
            alt="NEAR Treasury"
            width={40}
            height={40}
          />
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700">
              Connect to NEAR Treasury
            </h3>
            <p className="font-sans text-sm text-gray-600">
              Create on-chain payment proposals directly from approved
              submissions and automatically track their status.
            </p>
          </div>
        </div>
        <Button variant="default" onClick={() => setConnectModalOpen(true)}>
          Connect
        </Button>
      </div>

      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="w-[512px] p-6">
          <DialogHeader>
            <DialogTitle className="font-bold">
              Connect your NEAR Treasury
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              <Link
                href="https://neartreasury.com"
                className="underline underline-offset-[3px]"
                target="_blank"
              >
                Learn more
              </Link>{' '}
              about NEAR Treasury
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2 text-sm text-slate-500">
                <p>
                  <span className="mr-1">1.</span>
                  Add
                  <span
                    className="inline-flex cursor-pointer items-center gap-1 rounded px-1 font-bold hover:bg-gray-100"
                    onClick={() => {
                      navigator.clipboard.writeText('nearn-io.near');
                      toast.success('Copied to clipboard!');
                    }}
                  >
                    nearn-io.near <Copy className="h-3 w-3" />
                  </span>
                  as a member with Requestor role to your DAO.
                </p>
                <p>
                  <span className="mr-1">2.</span>
                  Approve the member creation request.
                </p>
                <p>
                  <span className="mr-1">3.</span>
                  Once all the above is complete, please paste your NEAR
                  Treasury link below.
                </p>
              </div>

              <SocialInput
                required
                name="nearTreasuryFrontend"
                socialName="website"
                formLabel="NEAR Treasury Link"
                placeholder="your-treasury.near.page"
                control={form.control}
                hideMessage={!!frontendLinkTransformedError}
                withIcon={false}
              />

              {frontendLinkTransformedError && (
                <div className="mt-4 flex items-center gap-3 bg-red-50 p-3 text-red-500">
                  <TriangleAlert className="h-full w-5" />
                  <p className="h-full w-full text-sm">
                    The member{' '}
                    <span
                      className="inline-flex cursor-pointer items-center gap-1 rounded py-0.5 font-bold hover:bg-red-100"
                      onClick={() => {
                        navigator.clipboard.writeText('nearn-io.near');
                        toast.success('Copied to clipboard!');
                      }}
                    >
                      nearn-io.near <Copy className="h-4 w-4" />
                    </span>{' '}
                    is not a requestor in your Treasury, so NEARN cannot submit
                    payment proposals. To fix this, go to{' '}
                    <Link
                      href={formHelpfulUrl(frontendLinkTransformedError)}
                      className="underline underline-offset-[3px]"
                      target="_blank"
                    >
                      NEAR Treasury
                    </Link>{' '}
                    and add the member with the &quot;Requestor&quot;
                    permission.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setConnectModalOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/NEARTreasuryLogo.svg"
            alt="NEAR Treasury"
            className="my-auto"
            width={40}
            height={40}
          />
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-700">
              NEAR Treasury
            </h3>
            <p className="text-sm text-gray-600">
              Connected with{' '}
              <Link
                href={getURLSanitized(
                  sponsorData.nearTreasury?.frontend ||
                    'https://neartreasury.com',
                )}
                className="underline underline-offset-[3px]"
                target="_blank"
              >
                {sponsorData.nearTreasury?.dao}
              </Link>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-slate-500"
          onClick={() => {
            setDisconnectModalOpen(true);
          }}
        >
          Disconnect
        </Button>
      </div>
      {!isRequestor && !isRequestorLoading && (
        <div className="mt-4 flex items-center gap-3 bg-red-50 p-3 text-red-500">
          <TriangleAlert className="h-full w-5" />
          <p className="h-full w-full text-sm">
            The member{' '}
            <span
              className="inline-flex cursor-pointer items-center gap-1 rounded py-0.5 font-bold hover:bg-red-100"
              onClick={() => {
                navigator.clipboard.writeText('nearn-io.near');
                toast.success('Copied to clipboard!');
              }}
            >
              nearn-io.near <Copy className="h-4 w-4" />
            </span>{' '}
            was removed from your Treasury, so NEARN can no longer submit
            payment proposals. To fix this, go to{' '}
            <Link
              href={formHelpfulUrl(
                sponsorData.nearTreasury?.frontend ||
                  'https://neartreasury.com',
              )}
              className="underline underline-offset-[3px]"
              target="_blank"
            >
              NEAR Treasury
            </Link>{' '}
            and add the member back with the &quot;Requestor&quot; permission.
          </p>
        </div>
      )}
      {!isLoadingDaoPolicy && !isValidDaoPolicy && (
        <div className="mt-4 flex items-center gap-3 bg-red-50 p-3 text-red-500">
          <TriangleAlert className="h-full w-5" />
          <p className="h-full w-full text-sm">
            The DAO policy is not compatible with NEARN: the proposal deposit
            exceeds 1 NEAR. To continue using NEARN Treasury integration, lower
            the required deposit in your DAO policy settings.
          </p>
        </div>
      )}
      <Dialog
        open={disconnectModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDisconnectModalOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Disconnect NEAR Treasury?
            </DialogTitle>
            <DialogDescription>
              After disconnecting, you won&apos;t be able to quickly create
              payment requests without taking additional steps.
              <br />
              However, you can reconnect NEAR Treasury at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex w-full justify-between">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                setDisconnectModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                onSubmit({
                  nearTreasuryFrontend: '',
                  nearTreasuryDao: null,
                });
                setDisconnectModalOpen(false);
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
