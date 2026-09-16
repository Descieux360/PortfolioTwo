// Each project gets a page at /projects/<slug> automatically.
//
// links.live / links.repo — omit (null) whichever doesn't apply. If a
// project has neither, only the "View code" snippet (if present) will show.
//
// codeSnippet is optional — a short, representative excerpt shown in a
// collapsible "View code" panel on the project's page. Keep it short
// (10–20 lines); it's meant to be a taste of how you write code, not a
// full file dump.

export const PROJECTS = [
  {
    slug: 'kally2',
    title: 'Kally2 — scheduling platform at Korollc',
    period: 'Internship, 2026',
    role: 'Frontend Engineering Intern',
    summary: 'A Cal.com-based scheduling platform, shipped as Kally2.',
    description: [
      'Kally2 is a Cal.com-based scheduling platform built at Korollc inside a Turborepo monorepo. I worked on booking flows on top of existing collective and round-robin scheduling logic across a multi-tenant hierarchy — closing production-readiness gaps rather than building greenfield features.',
      'Most of the interesting problems were about the tRPC mental model inside a large monorepo: designing procedures that stayed type-safe across a Next.js App Router and Pages Router boundary, and working from a passing Vitest suite toward edge cases the tests hadn\u2019t covered yet.',
    ],
    tags: ['Next.js', 'tRPC', 'Prisma', 'PostgreSQL'],
    links: { live: 'https://kally2.example.com', repo: null },
    note: 'Built at Korollc — source is closed; swap in your live URL once it\u2019s public.',
    codeSnippet: {
      label: 'availability.router.ts',
      code: `export const availabilityRouter = router({
  forSlot: protectedProcedure
    .input(z.object({ eventTypeId: z.number(), start: z.date() }))
    .query(async ({ input, ctx }) => {
      const conflicts = await ctx.prisma.booking.findMany({
        where: { eventTypeId: input.eventTypeId, startTime: input.start },
      });
      return { available: conflicts.length === 0 };
    }),
});`,
    },
  },
  {
    slug: 'nura',
    title: 'NURA — Parentalité Positive',
    period: 'UNICEF Cameroon innovation challenge, 2026',
    role: 'Co-founder & Lead Frontend Developer',
    summary: 'A parenting PWA pairing a retrieval-augmented chatbot with micro-learning lessons.',
    description: [
      'As co-founder and lead frontend developer, I lead the product and UI work on NURA — a progressive web app pairing a retrieval-augmented chatbot, reachable on WhatsApp and web, with short, quiz-checked parenting lessons.',
      'Supabase with pgvector handles retrieval, Vercel Functions keep API keys server-side, and an abstracted response layer means the underlying model (currently Gemini, for cost reasons during the demo) can be swapped without touching the UI. NURA was submitted to a UNICEF Cameroon innovation challenge.',
    ],
    tags: ['React', 'TypeScript', 'Supabase', 'Vite'],
    // Repo is private — only a live link is shown.
    links: { live: 'https://positive-parenting-xi.vercel.app/', repo: null },
    note: 'Private repository — live demo available.',
    codeSnippet: {
      label: 'retrieveContext.ts',
      code: `export async function retrieveContext(query: string, topK = 5) {
  const embedding = await embed(query);
  const { data } = await supabase.rpc('match_lessons', {
    query_embedding: embedding,
    match_count: topK,
  });
  return data ?? [];
}`,
    },
  },
  {
    slug: 'weather',
    title: 'Weather',
    period: 'Personal project, 2026',
    role: 'Developer',
    summary: 'A fast, key-free weather app built to try React 19 and Tailwind v4 in a small real project.',
    description: [
      'A weather lookup app built to get hands-on with a few things at once: React 19\u2019s functional components with custom hooks and context-driven state, TypeScript across every async payload and context variable, and Tailwind CSS v4\u2019s new @theme directive for mapping a custom color matrix, variable font assets and styled scrollbars without a JS config file.',
      'Location search runs against the Open-Meteo Geocoding API for zero-latency, key-free client-side search, and forecasts come from the Open-Meteo Forecast API with coordinate mapping and automatic local timezone adjustment. Vite handles the build, with near-instant HMR during development and tree-shaken production output.',
    ],
    tags: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4'],
    links: { live: 'https://weather-app-1-mu-silk.vercel.app', repo: 'https://github.com/Descieux360/Weather_APP_1' },
    note: null,
    codeSnippet: {
      label: 'useForecast.ts',
      code: `export function useForecast(coords: Coordinates | null) {
  const [forecast, setForecast] = useState<Forecast | null>(null);

  useEffect(() => {
    if (!coords) return;
    const controller = new AbortController();

    fetchForecast(coords, { signal: controller.signal }).then(setForecast);
    return () => controller.abort();
  }, [coords]);

  return forecast;
}`,
    },
  },
  {
    slug: 'movie-explorer',
    title: 'Movie Explorer',
    period: 'Personal project, 2026',
    role: 'Developer',
    summary: 'A movie discovery app with real-time Appwrite syncing and strict schema validation.',
    description: [
      'A movie discovery app backed by Appwrite for document storage and real-time syncing. The interesting part wasn\u2019t the UI so much as keeping the database payloads honest: type-safe guards for Float values like ratings and scores, and separate guards for Integer values like counts and IDs, so a malformed payload fails before it reaches the database rather than after.',
      'Trending state loads independently of the main list via its own isTrendingLoading flag, with Tailwind\u2019s animate-pulse driving skeleton loaders so the layout doesn\u2019t shift while data streams in. Modal components handle the detailed view — full overviews, posters and metrics — without leaving the list.',
    ],
    tags: ['React', 'Tailwind CSS', 'Appwrite'],
    links: { live: 'https://movie-app-1-tau.vercel.app', repo: 'https://github.com/Descieux360/movie_app_1' },
    note: null,
    codeSnippet: {
      label: 'validators.ts',
      code: `export function toSafeFloat(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toSafeInt(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}`,
    },
  },
  {
    slug: 'product-list-cart',
    title: 'Product List with Cart',
    period: 'Frontend Mentor challenge, 2026',
    role: 'Developer',
    summary: 'A Frontend Mentor challenge: a product list and cart built in vanilla JavaScript.',
    description: [
      'A Frontend Mentor challenge built without a framework, on purpose: plain HTML, CSS and JavaScript, managing cart state, quantity updates and totals directly against the DOM.',
      'It\u2019s a smaller project than the others here, but it\u2019s the one I point to when someone asks whether I understand what React is abstracting away underneath.',
    ],
    tags: ['JavaScript', 'HTML', 'CSS'],
    links: { live: 'https://product-list-with-cards-frontend-me.vercel.app/', repo: 'https://github.com/Descieux360/Product-List-with-cards-Frontend-Mentor-' },
    note: null,
    codeSnippet: {
      label: 'cart.js',
      code: `function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
}`,
    },
  },
  {
    slug: 'roadmap-tracker',
    title: 'DSA + frontend roadmap tracker',
    period: 'Personal tool, 2026',
    role: 'Developer',
    summary: 'An interactive tracker built to hold myself to an 8-week study plan.',
    description: [
      'A small interactive tracker built to hold myself to an 8-week study plan covering data structures, algorithms and frontend fundamentals — one checklist that made the roadmap harder to quietly abandon.',
      'No backend, no build step: plain HTML, CSS and JavaScript, deliberately kept simple since its only job was to outlast my motivation on days I didn\u2019t have any.',
    ],
    tags: ['JavaScript', 'HTML', 'CSS'],
    links: { live: null, repo: 'https://github.com/yourusername/roadmap-tracker' },
    note: null,
    codeSnippet: {
      label: 'progress.js',
      code: `function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  task.done = !task.done;
  updateProgressBar();
}`,
    },
  },
];

// Which projects (by slug) show up as "Selected work" on the homepage.
// The Projects page always lists everything in PROJECTS above.
export const FEATURED_SLUGS = ['kally2', 'nura', 'weather'];
