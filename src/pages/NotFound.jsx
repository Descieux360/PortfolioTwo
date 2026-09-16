import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page container">
      <div className="section-head">
        <h2 className="h2">Page not found</h2>
        <p className="lede">That page doesn&rsquo;t exist, or it moved.</p>
      </div>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
