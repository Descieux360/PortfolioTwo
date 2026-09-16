# Portfolio

A React + Vite portfolio with real client-side routes (Home, Projects,
About, Blog, Contact), a light/dark theme toggle, and a warm
paper-and-forest visual theme — styled entirely with Tailwind CSS v4.

## Running it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## The files you'll actually edit

All content lives under `src/data/`, split by concern so you're never
hunting through one giant file:

| File | What's in it |
|---|---|
| `src/data/site.js` | Your name, role, location, tagline, bio paragraphs, email, GitHub, LinkedIn, photo path |
| `src/data/skills.js` | Skills, grouped under labels (Languages, Frontend, etc.) |
| `src/data/timeline.js` | The About page timeline/experience rows |
| `src/data/projects.js` | Every project — also controls which 3 are "featured" on the homepage |
| `src/data/posts.js` | Blog posts |

None of the files under `src/components/` or `src/pages/` hardcode content —
they all read from `src/data/`. You shouldn't need to touch them for a
content change.

### Adding a project

Add an object to the array in `src/data/projects.js` with a unique `slug` —
a route at `/projects/your-slug` is generated automatically. Fields:

- `links.live` / `links.repo` — set either (or both) to `null` to hide that
  button. If a project's private, just leave `repo` as `null`.
- `codeSnippet` — optional. A short (10–20 line) excerpt shown in a
  collapsible "View code" panel on the project's page. Leave it out
  entirely if you don't want that button to show.
- To feature a project on the homepage, add its `slug` to `FEATURED_SLUGS`
  at the bottom of the same file (keep it to 2–3 for the homepage grid).

### Adding a blog post

Same idea in `src/data/posts.js` — add an object with a unique `slug`,
`body` as an array of paragraph strings. Remove an entry to unpublish it.

### Adding your photo

Drop a square image at `public/profile.jpg` (roughly 500×500px). It shows
up automatically on the About page and homepage. Until you add one, your
initials show instead — nothing breaks either way. Delete
`public/ADD_YOUR_PHOTO_HERE.txt` once you've added the real photo.

## Project structure

```
public/
  profile.jpg            <- add your photo here
src/
  data/                   <- edit these for content changes
    site.js, skills.js, timeline.js, projects.js, posts.js
  hooks/
    useTheme.js            light/dark theme state, persisted to localStorage
  components/
    Nav.jsx               top navigation + mobile menu + theme toggle
    Footer.jsx
    Card.jsx              reusable card surface (div or router Link)
    Portrait.jsx          photo with fallback to initials
    Clock.jsx             live timezone badge shown in the hero
    BackToTop.jsx
  pages/
    Home.jsx, About.jsx, Projects.jsx, ProjectDetail.jsx,
    Blog.jsx, BlogPost.jsx, Contact.jsx, NotFound.jsx
  index.css               Tailwind import + design tokens + component classes
  App.jsx                 route definitions
  main.jsx                entry point
```

## Styling: Tailwind v4, theme tokens, and dark mode

Styling is Tailwind CSS v4 throughout — no vanilla CSS files, no CSS-in-JS.
`src/index.css` has three parts:

1. `@theme { ... }` — defines the design tokens (colors, fonts) as CSS
   variables, which is also what generates the Tailwind utilities you use
   in JSX (`bg-pine`, `text-ink-soft`, `font-display`, etc).
2. `.dark { ... }` — redefines those same variables for dark mode. Every
   utility that uses a token (e.g. `bg-surface`) automatically follows
   whichever set is active — components never need their own `dark:`
   classes for color.
3. `@layer components { ... }` — the reusable classes used across pages
   (`.card`, `.btn-primary`, `.chip`, `.nav-link`, etc.), each built from
   `@apply`-ed Tailwind utilities. This is what keeps JSX readable
   (`className="card project-card"` instead of a wall of utility classes)
   while still being 100% Tailwind under the hood.

**Dark mode** is a manual toggle (the sun/moon button in the nav), not
tied to the OS setting — `src/hooks/useTheme.js` persists the choice to
`localStorage` and applies a `.dark` class to `<html>`. A small inline
script in `index.html` applies that class before React mounts, so there's
no flash of the wrong theme on load.

To change the palette, edit the color values inside `@theme` (light mode)
and `.dark` (dark mode) at the top of `src/index.css` — everything else
updates automatically.

## The hero

The hero and nav are designed as one visual unit: the nav has no
background of its own at the top of the page, so it reads as part of the
hero rather than a bar sitting on top of it. It gains a background (and a
subtle blur/shadow) once you scroll past the hero, for readability over
page content. The hero itself is `min-h-screen`, so hero + nav together
fill the viewport on load.

There's no particle/canvas effect right now — that was removed on
purpose so you can add your own animation later without fighting
existing code. `src/components/` has no hero-specific visual component;
if you add one, drop it into the `.hero` section in `src/pages/Home.jsx`.

## Things to personalize before you ship this

1. **`site.js`**: `email`, `github`, `linkedin` are placeholders — replace
   them.
2. **Your photo** — see "Adding your photo" above.
3. **Live/repo links** in `projects.js` — several are placeholders
   (Kally2's live URL, NURA's demo URL, and the GitHub URLs for the
   smaller projects). Swap in the real ones.
4. **Blog post bodies** in `posts.js` are placeholders. Replace them with
   your own writing whenever you're ready, or delete an entry to
   unpublish it.
5. **The contact form doesn't send email yet.** It validates and shows a
   confirmation message, but there's no backend wired up. The
   straightforward fix, since you're already using Vercel Functions
   elsewhere: add an `/api/contact` serverless function that forwards the
   form data to an email API (e.g. Resend, Postmark), and call it with
   `fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })`
   inside `handleSubmit` in `src/pages/Contact.jsx`.

## Deploying

This is a static single-page app — any static host works (Vercel,
Netlify, Cloudflare Pages). `vercel.json` is already included with the
rewrite rule client-side routes need (so refreshing `/projects/nura`
doesn't 404). If you deploy elsewhere, make sure your host serves
`index.html` for all unmatched paths.
# Portfolio1
