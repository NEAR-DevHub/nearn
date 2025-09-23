import { Link, Text } from '@react-email/components';
import React from 'react';

import { getURL } from '@/utils/validUrl';

export const UnsubscribeLine = () => {
  return (
    <Text className="mt-8 text-xs">
      <Link href="{{unsubscribeUrl}}" className="mr-2 text-slate-900 underline">
        Unsubscribe
      </Link>
      <Link
        href={`${getURL()}#emailPreferences`}
        className="text-slate-900 underline"
      >
        Update Your Preferences
      </Link>{' '}
    </Text>
  );
};
