import React, { useState } from 'react';
import { SITE } from '../data/site.js';

// Shows /public/profile.jpg if it exists; falls back to initials if it
// doesn't (or hasn't been added yet), so the site never shows a broken
// image icon. Add your photo at /public/profile.jpg — see README.md.
export default function Portrait({ small = false }) {
  const [error, setError] = useState(false);

  return (
    <div className={`portrait${small ? ' portrait-sm' : ''}`}>
      {!error ? (
        <img
          src={SITE.photo}
          alt={`Portrait of ${SITE.name}`}
          onError={() => setError(true)}
        />
      ) : (
        <span className="portrait-fallback">{SITE.initials}</span>
      )}
    </div>
  );
}
