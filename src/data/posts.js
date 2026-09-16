// Placeholder posts — replace excerpt/body with your own writing whenever
// you're ready. Add a new object to publish a new post; a route at
// /blog/<slug> is generated automatically. Remove an object to unpublish.

export const POSTS = [
  {
    slug: 'trpc-lessons-from-a-cal-com-fork',
    date: 'Mar 2026',
    readTime: '6 min',
    tag: 'Engineering',
    title: 'What building inside a Cal.com fork taught me about tRPC',
    excerpt: 'Coming from REST, tRPC felt like a trick at first — until the type errors started catching my mistakes before I ever ran the app.',
    body: [
      'Placeholder post. Replace with your own write-up.',
      'Talk about what the tRPC mental model actually changed about how you design a client-server boundary, and where it fought back inside a large monorepo.',
    ],
  },
  {
    slug: 'retrieval-augmented-parenting-advice',
    date: 'Jan 2026',
    readTime: '5 min',
    tag: 'AI & product',
    title: 'Retrieval-augmented parenting advice: notes from building NURA',
    excerpt: 'pgvector, a free-tier model, and WhatsApp as a UI — the constraints ended up shaping the product more than any feature idea did.',
    body: [
      'Placeholder post. Replace with your own write-up.',
      'Talk about how you scoped retrieval quality against a free-tier LLM, and what changed once WhatsApp became the primary interface instead of the web app.',
    ],
  },
  {
    slug: 'frontend-skills-that-dont-get-automated',
    date: 'Dec 2025',
    readTime: '4 min',
    tag: 'Career',
    title: "The frontend skills that don't get automated",
    excerpt: 'Accessibility, testing and performance are unglamorous — and increasingly the part of the job that separates a developer from a demo.',
    body: [
      'Placeholder post. Replace with your own write-up.',
      'Talk through concrete examples of where accessibility, tests or performance work actually changed an outcome on a real project.',
    ],
  },
];
