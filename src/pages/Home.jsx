import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Clock from '../components/Clock.jsx';
import Portrait from '../components/Portrait.jsx';
import Card from '../components/Card.jsx';
import { SITE } from '../data/site.js';
import { PROJECTS, FEATURED_SLUGS } from '../data/projects.js';
import { POSTS } from '../data/posts.js';

const featured = FEATURED_SLUGS
  .map((slug) => PROJECTS.find((p) => p.slug === slug))
  .filter(Boolean);

const FACTS = [
  { value: String(PROJECTS.length), label: 'Shipped or in-progress apps' },
  { value: 'UTC+1', label: `${SITE.location.split(',')[0]} — full overlap with EU hours` },
  { value: 'TS-first', label: 'TypeScript across every project below' },
  { value: 'Remote', label: 'Looking for employee-track roles' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="rise [animation-delay:50ms]">
            <Clock />
          </div>
          <h1 className="rise [animation-delay:150ms]">{SITE.name}</h1>
          <p className="hero-sub rise [animation-delay:250ms]">{SITE.tagline}</p>
          <div className="hero-actions rise [animation-delay:350ms]">
            <Link to="/projects" className="btn btn-primary">View projects</Link>
            <Link to="/contact" className="btn btn-ghost">Get in touch</Link>
          </div>
          <p className="hero-note rise [animation-delay:450ms]">
            {SITE.timezoneLabel} (UTC+1) overlaps a full working day with European teams, and mornings with the US East Coast.
          </p>
        </div>
      </section>

      <section className="section container">
        <div className="facts-strip">
          {FACTS.map((f) => (
            <Card key={f.label} className="fact-tile">
              <div className="fact-tile-value">{f.value}</div>
              <div className="fact-tile-label">{f.label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head flex justify-between items-end flex-wrap gap-4">
          <h2 className="h2">Selected work</h2>
          <Link to="/projects" className="nav-link">See all projects →</Link>
        </div>
        <div className="card-grid">
          {featured.map((p) => (
            <Card to={`/projects/${p.slug}`} hover key={p.slug} className="project-card">
              <div className="project-card-period">{p.period}</div>
              <h3>{p.title}</h3>
              <p className="project-card-summary">{p.summary}</p>
              <div className="project-card-tags">
                {p.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
              </div>
              <span className="project-card-cta">View case study <ArrowUpRight size={14} /></span>
            </Card>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="about-grid">
          <Card className="about-card p-8">
            <Portrait />
            <div className="font-semibold">{SITE.name}</div>
            <div className="text-ink-soft text-sm">{SITE.role}</div>
          </Card>
          <Card className="detail-body p-8">
            <h2 className="h2 text-[1.7rem] mb-4">A bit about me</h2>
            <p className="text-ink-soft max-w-[68ch] mb-5">
              {SITE.aboutIntro[0]}
            </p>
            <Link to="/about" className="btn btn-ghost">More about me</Link>
          </Card>
        </div>
      </section>

      <section className="section container">
        <div className="section-head flex justify-between items-end flex-wrap gap-4">
          <h2 className="h2">Recent writing</h2>
          <Link to="/blog" className="nav-link">See all posts →</Link>
        </div>
        <div className="post-list">
          {POSTS.slice(0, 2).map((post) => (
            <Card to={`/blog/${post.slug}`} hover key={post.slug} className="post-row">
              <div className="post-meta">
                <span>{post.date}</span>
                <span>{post.readTime} read</span>
                <span className="tag-accent">{post.tag}</span>
              </div>
              <h3>{post.title}</h3>
              <p className="post-excerpt">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
