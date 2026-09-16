import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Github } from 'lucide-react';
import Card from '../components/Card.jsx';
import CodeExplorer from '../components/CodeExplorer.jsx';
import { PROJECTS } from '../data/projects.js';
import NotFound from './NotFound.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) return <NotFound />;

  return (
    <div className="page container">
      <Link to="/projects" className="back-link"><ArrowLeft size={15} /> All projects</Link>

      <div className="detail-head">
        <div className="project-card-period">{project.period} · {project.role}</div>
        <h1>{project.title}</h1>
        <div className="detail-tags">
          {project.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
        </div>
      </div>

      <Card className="detail-body">
        {project.description.map((para, i) => <p key={i}>{para}</p>)}

        {project.note && <p className="detail-note">{project.note}</p>}

        <div className="detail-links">
          {project.links.live && (
            <a href={project.links.live} target="_blank" rel="noreferrer" className="btn btn-primary">
              View live <ArrowUpRight size={15} />
            </a>
          )}
          {project.links.repo && (
            <a href={project.links.repo} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Github size={15} /> View repo
            </a>
          )}
          <div className="basis-full">
            <CodeExplorer repoUrl={project.links.repo} fallback={project.codeSnippet} />
          </div>
        </div>
      </Card>
    </div>
  );
}