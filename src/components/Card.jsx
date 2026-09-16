import React from 'react';
import { Link } from 'react-router-dom';

// A single reusable surface. Renders as a <div>, or as a router <Link> when
// `to` is passed, so project/blog cards can be whole-card clickable links.
export default function Card({ to, hover = false, className = '', children, ...rest }) {
  const classes = `card${hover ? ' card-hover' : ''}${className ? ` ${className}` : ''}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
