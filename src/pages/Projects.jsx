import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Card from '../components/Card.jsx';
import { PROJECTS } from '../data/projects.js';

export default function Projects() {
  return (
    <div className="page container">
      <div className="section-head">
        <h2 className="h2">Selected work</h2>
        <p className="lede">Projects that show how I think, not just what I shipped. Click through for the full write-up, live links, and a peek at the code.</p>
      </div>

      <div className="card-grid">
        {PROJECTS.map((p) => (
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
    </div>
  );
}
