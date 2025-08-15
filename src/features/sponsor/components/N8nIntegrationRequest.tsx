import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/store/user';
import { getURL } from '@/utils/validUrl';

const CONNECTED_SPONSORS = (
  process.env.NEXT_PUBLIC_N8N_CONNECTED_SPONSORS || ''
)
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const n8nRequestSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(500, 'Maximum 500 characters allowed'),
});

type N8nRequestFormValues = z.infer<typeof n8nRequestSchema>;

export default function N8nIntegrationRequest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: isLoadingUser } = useUser();

  const isConnectedSponsor = Boolean(
    CONNECTED_SPONSORS.includes(user?.currentSponsorId ?? ''),
  );

  const form = useForm<N8nRequestFormValues>({
    resolver: zodResolver(n8nRequestSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data: N8nRequestFormValues) => {
    try {
      setIsLoading(true);

      const payload = {
        reason: data.reason,
        sponsor: user?.currentSponsor?.name,
        sponsorLink: `${getURL()}${user?.currentSponsor?.slug}`,
      };

      // Well, I understand that this is not ideal way, but
      // I don't think we actually have any issues with that so let's expose it.
      await axios.post(
        'https://n8n.nearn.io/webhook/823ad6f3-aec4-4060-b10d-862db1f3a1bc',
        payload,
      );

      toast.success('Your n8n access request has been submitted successfully!');
      setIsModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting n8n request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/assets/N8N.svg" alt="n8n" width={40} height={40} />
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700">
              n8n Workflow Automation
            </h3>
            <p className="font-sans text-sm text-gray-600">
              Automate the NEARN data with a wide collection of n8n components.
            </p>
          </div>
        </div>
        {isConnectedSponsor ? (
          <Button asChild>
            <Link
              href="https://n8n.nearn.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </Link>
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoadingUser}
          >
            Request Access
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request n8n Integration Access</DialogTitle>
            <DialogDescription>
              Tell us why you need n8n integration and how you plan to use it
              with NEARN.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your use case..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsModalOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isLoadingUser}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
