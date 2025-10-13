import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Default } from '@/layouts/Default';

import { AlertSettings } from '@/features/notification-settings/components/AlertSettings';

export default function NotificationSettingsPage() {
  const router = useRouter();

  return (
    <Default
      className="bg-white"
      hideFooter
      hideListingNavigation
      meta={<meta name="description" content="Notification Settings" />}
    >
      <div className="w-full space-y-6 px-4 pb-20 pt-6 md:mx-auto md:max-w-2xl">
        <div className="space-y-4">
          <Breadcrumbs />
          <Header />
        </div>
        <AlertSettings onSave={() => router.push('/notifications/')} />
      </div>
    </Default>
  );
}

const Breadcrumbs = () => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href="/notifications">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const Header = () => (
  <div className="space-y-2">
    <CardTitle className="text-xl font-bold text-slate-900">
      Notification Settings
    </CardTitle>
    <CardDescription className="text-sm text-slate-600">
      Tell us which notification you would like to receive!
    </CardDescription>
  </div>
);
