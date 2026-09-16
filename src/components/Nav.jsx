import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Github, Linkedin, Mail, Sun, Moon } from 'lucide-react';
import { SITE } from '../data/site.js';
import { useTheme } from '../hooks/useTheme.js';

// Order matches what people expect from a dev portfolio: Home, then the
// work, then who you are, then writing, then how to reach you.
const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.05);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <NavLink to="/" className="logo">
            {SITE.initials}<span>.</span>
          </NavLink>
          <nav className="nav-links">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-right">
            <button
              className="icon-btn"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href={`mailto:${SITE.email}`} className="icon-btn" aria-label="Email">
              <Mail size={16} />
            </a>
            <button className="icon-btn menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Menu size={17} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="icon-btn mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <div className="mobile-social">
            <button className="icon-btn" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href={`mailto:${SITE.email}`} className="icon-btn" aria-label="Email"><Mail size={16} /></a>
            <a href={SITE.github} className="icon-btn" aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={16} /></a>
            <a href={SITE.linkedin} className="icon-btn" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={16} /></a>
          </div>
        </div>
      )}
    </>
  );
}
