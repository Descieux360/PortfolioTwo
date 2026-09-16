import React, { useEffect, useState } from 'react';
import { SITE } from '../data/site.js';

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-GB', {
    timeZone: SITE.timezone,
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="badge">
      <span className="badge-dot" />
      {SITE.location} — <span className="badge-time">{time} {SITE.timezoneLabel}</span>
    </div>
  );
}
