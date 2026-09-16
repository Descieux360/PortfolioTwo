import React from 'react';
import { SITE } from '../data/site.js';

export default function Footer() {
  return (
    <footer className="footer container">
      <span>© {new Date().getFullYear()} {SITE.name}</span>
      <span>Built with React &amp; Three.js</span>
    </footer>
  );
}
