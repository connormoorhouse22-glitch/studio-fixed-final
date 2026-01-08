
'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface ClientSideTimestampProps {
  timestamp: string;
  formatString?: string;
}

export function ClientSideTimestamp({ timestamp, formatString = 'yyyy-MM-dd HH:mm:ss' }: ClientSideTimestampProps) {
  const [formattedTimestamp, setFormattedTimestamp] = useState('');

  useEffect(() => {
    // This effect runs only on the client side, after initial hydration.
    // This ensures the user's local timezone is used without causing a mismatch.
    setFormattedTimestamp(format(parseISO(timestamp), formatString));
  }, [timestamp, formatString]);

  // Render a placeholder or nothing on the server and initial client render
  if (!formattedTimestamp) {
    return null;
  }

  return <>{formattedTimestamp}</>;
}
