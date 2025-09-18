import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { getURL } from '@/utils/validUrl';

export const UnsubscribeLine = () => {
  return (
    <p style={{ fontSize: '11px', lineHeight: '20px', marginTop: '16px' }}>
      <a
        href={`${getURL()}/#emailPreferences`}
        style={{ fontSize: '11px', color: '#007BFF' }}
      >
        Click here
      </a>{' '}
      to update your email preferences on {PROJECT_NAME} (recommended) or{' '}
      <a
        href="{{unsubscribeUrl}}"
        style={{ fontSize: '11px', color: '#007BFF' }}
      >
        click here
      </a>{' '}
      to unsubscribe from all future emails from {PROJECT_NAME}
    </p>
  );
};
