import React from 'react';
import Card from '../components/Card.jsx';
import { POSTS } from '../data/posts.js';

export default function Blog() {
  return (
    <div className="page container">
      <div className="section-head">
        <h2 className="h2">Writing</h2>
        <p className="lede">Notes on the things I build, mostly written for the person I was six months ago.</p>
      </div>

      <div className="post-list">
        {POSTS.map((post) => (
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
    </div>
  );
}
