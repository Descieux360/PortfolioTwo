import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, FolderKanban } from 'lucide-react';

export default function NotFound() {
  return (
    // Added flex-1 and increased min-h to help push the footer to the bottom
    <div className="page container flex flex-col items-center justify-center min-h-[calc(100vh-118px)] md:min-h-[calc(100vh-85px)] text-center mt-auto">
      
      {/* Visual Anchor: The "Detective" Loop */}
      <div className="inline-flex items-center justify-center p-4 rounded-full bg-pine-tint text-pine mb-6">
        <Search size={42} strokeWidth={1.5} />
      </div>
      
      {/* Text Content */}
      <div className="section-head max-w-md mx-auto">
        <h2 className="h2 mb-3">404: Page not found</h2>
        <p className="lede text-ink-soft mb-2">
          We searched the entire component tree, but this route seems to be returning <code className="text-pine bg-pine-tint px-1.5 py-0.5 rounded text-sm font-mono">undefined</code>. 
        </p>
        <p className="text-ink-soft text-[0.95rem]">
          The page you are looking for might have been removed, had its name changed, or never existed in the first place.
        </p>
      </div>
      
      {/* Call to Actions */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link to="/" className="btn btn-primary flex items-center gap-2">
          <Home size={16} /> Back to home
        </Link>
        <Link to="/projects" className="btn btn-ghost flex items-center gap-2">
          <FolderKanban size={16} /> Browse projects
        </Link>
      </div>
    </div>
  );
}