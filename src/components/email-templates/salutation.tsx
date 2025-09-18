import React from 'react';

import { PROJECT_NAME } from '@/constants/project';
import { styles } from '@/email-templates/styles';

export const Salutation = () => {
  return (
    <p style={styles.salutation}>
      Best regards,
      <br />
      {PROJECT_NAME}
    </p>
  );
};
