import React from 'react';
import Card from '../components/Card.jsx';
import Portrait from '../components/Portrait.jsx';
import { SITE } from '../data/site.js';
import { SKILL_GROUPS } from '../data/skills.js';
import { TIMELINE } from '../data/timeline.js';

export default function About() {
  return (
    <div className="page container">
      <div className="section-head">
        <h2 className="h2">About</h2>
      </div>

      <div className="about-grid ">
        <Card className="about-card">
          <Portrait />
          <div className="fact">
            <span className="fact-label">Based in</span>
            <span>{SITE.location}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Focus</span>
            <span>{SITE.role}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Currently</span>
            <span>{SITE.currentlyAt}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Employment</span>
            <span>{SITE.employementRole}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Open to</span>
            <span>Remote roles</span>
          </div>
        </Card>

        <div>
          <div className="bio">
            {SITE.aboutIntro.map((para, i) => <p key={i}>{para}</p>)}
          </div>

          {SKILL_GROUPS.map((group) => (
            <div className="skill-group" key={group.label}>
              <div className="skill-group-label">{group.label}</div>
              <div className="skill-group-items">
                {group.items.map((item) => <span className="chip" key={item}>{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline">
        {TIMELINE.map((t, i) => (
          <div className="timeline-row" key={i}>
            <div className="timeline-year">{t.year}</div>
            <div>
              <div className="timeline-role">{t.role}</div>
              <div className="timeline-org">{t.org}</div>
              <div className="timeline-detail">{t.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
