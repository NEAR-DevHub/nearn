import React from 'react';

import { styles } from '../styles';

interface AlertProps {
  type: string;
  id?: string;
  userId?: string;
  otherInfo?: string;
  errorMessage: string;
}

export const AlertTemplate = ({
  type,
  id,
  userId,
  otherInfo,
  errorMessage,
}: AlertProps) => {
  return (
    <div style={styles.container}>
      <h4>Error Report</h4>
      <p style={styles.textWithMargin}>
        Could not send email for type <strong>{type}</strong> to id{' '}
        <strong>{id}</strong>.
      </p>
      {userId && (
        <p style={styles.text}>
          User ID: <strong>{userId}</strong>
        </p>
      )}
      {otherInfo && (
        <p style={styles.text}>
          Additional Information: <strong>{otherInfo}</strong>
        </p>
      )}
      <p style={styles.text}>Error Message: {errorMessage}</p>
    </div>
  );
};
