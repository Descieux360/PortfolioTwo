import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../components/Card.jsx';
import { POSTS } from '../data/posts.js';
import NotFound from './NotFound.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) return <NotFound />;

  return (
    <div className="page container">
      <Link to="/blog" className="back-link"><ArrowLeft size={15} /> All posts</Link>

      <Card className="post-body">
        <div className="post-body-meta">
          <span>{post.date}</span>
          <span>{post.readTime} read</span>
          <span className="text-lake">{post.tag}</span>
        </div>
        <h1>{post.title}</h1>
        {post.body.map((para, i) => <p key={i}>{para}</p>)}
      </Card>
    </div>
  );
}
