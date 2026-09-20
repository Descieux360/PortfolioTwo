// Add a new object to publish a new post; a route at /blog/<slug> is
// generated automatically. Remove an object to unpublish.

export const POSTS = [
  {
    slug: 'trpc-lessons-from-a-cal-com-fork',
    date: 'Mar 2026',
    readTime: '4 min',
    tag: 'Engineering',
    title: 'What building inside a Cal.com fork taught me about tRPC',
    excerpt: 'Coming from REST, tRPC felt like a trick at first — until the type errors started catching my mistakes before I ever ran the app.',
    body: [
      `I came to tRPC with a REST habit: define an endpoint, write a handler, hand-write a type for the response, and hope the two never drift apart. Working inside a fork of Cal.com, a large Next.js monorepo where tRPC is the main way the frontend talks to the backend, was the first time I had to live with the alternative every day.`,
      `The idea is less magic than it looks. The server defines a router. Each procedure has an input schema (usually Zod) and a resolver. The client never imports server code; it only imports the type of the router. TypeScript infers the rest, so calling a procedure from a component gives you autocomplete on the input and a fully typed result, with no code generation step and no separate schema file to maintain.`,
      `The first thing that changed was how I refactored. Rename a field in a resolver and the compiler immediately lists every component that depended on it. With REST, I would have found out in the browser, or worse, from a user. The feedback loop moved from "run the app and click around" to "read the red squiggles", which is a much cheaper place to catch a mistake.`,
      `The second thing was how I think about the client-server boundary. When the contract is a function signature, you stop thinking in URLs and verbs and start thinking in operations: get the bookings for this user, update this event type. The input schema becomes the one place where validation lives, and it doubles as documentation for whoever reads the code next. In an unfamiliar codebase, reading a procedure's input schema first turned out to be the fastest way to understand what it does.`,
      `It did fight back in a few places. In a big monorepo the client type is inferred from the whole router, so editor responsiveness and type-check times become real concerns as the router grows. Error messages from deeply nested inferred types can be long and unfriendly. Understanding where session and auth context get attached through middleware took real reading, because that logic is invisible at the call site.`,
      `Two more things are worth keeping in mind. First, the types describe the shape of the data, not whether it is a good shape. Nothing stops a procedure from returning far more than a component needs, so over-fetching is still a discipline you have to keep. Also watch how values like dates cross the wire, since JSON has no Date type. That is what transformers such as superjson are for.`,
      `Second, tRPC is not a public API. It couples your client and server to the same TypeScript codebase, which is the whole point, but it means anything outside that world (a mobile app in another language, third-party integrations, webhooks) still needs a conventional interface.`,
      `My takeaways: treat the router as the real surface area of the backend, keep procedures thin and push logic into functions you can test on their own, and let the compiler do the tedious cross-checking so your attention goes to the parts it can't check. Coming from REST, that trade felt like cheating at first. Now it just feels like the sensible default for a TypeScript-on-both-ends codebase.`,
    ],
  },
  {
    slug: 'retrieval-augmented-parenting-advice',
    date: 'Jan 2026',
    readTime: '4 min',
    tag: 'AI & product',
    title: 'Retrieval-augmented parenting advice: notes from building NURA',
    excerpt: 'pgvector, a free-tier model, and WhatsApp as a UI — the constraints ended up shaping the product more than any feature idea did.',
    body: [
      `NURA is a parenting-advice assistant, and almost every interesting decision in it came from a constraint rather than a feature idea: a free-tier language model, a Postgres database I already had, and WhatsApp as the interface. Here is how each one shaped the product.`,
      `Start with storage. I used pgvector because I didn't want a second datastore. The embedding lives in a column next to the content and its metadata, so retrieval is a single SQL query: order by vector distance, add a WHERE clause for any filtering, limit to a handful of rows. One database means one thing to back up, migrate and reason about, which matters a lot when you are building alone.`,
      `The free-tier model was the harder constraint. Small context windows, rate limits and weaker instruction-following mean you can't just stuff twenty passages into a prompt and hope. Retrieval quality has to carry more of the weight. That pushed me to chunk the source material by topic rather than by a fixed character count, so each chunk is a self-contained piece of advice. It also pushed me to retrieve only a few chunks, and to set a relevance threshold below which the assistant admits it doesn't have a good answer instead of improvising one.`,
      `That last point matters more than it sounds. Parenting questions sit close to health and safety, and a confident wrong answer is worse than no answer. So the prompt tells the model to answer from the supplied passages only, and anything that sounds urgent should point the person toward a real professional rather than a paragraph of generated reassurance.`,
      `WhatsApp changed the product more than I expected. People don't write full, well-formed queries in a chat app. They send fragments and follow-ups: "what about at night?" means nothing to an embedding model on its own. So the follow-up has to be rewritten into a standalone question, using the last few turns of the conversation, before it is embedded and searched. Without that step, retrieval quality collapses in exactly the way real conversations go.`,
      `The channel also imposed practical limits. Webhooks expect a fast response, but generation is slow, so the handler acknowledges the message immediately and does the retrieval and generation in the background before replying. And a chat bubble is a terrible place for a wall of text. Having to keep answers short and conversational forced the advice to be clearer, which I now think is a better product than the longer answer I would have written for a web page.`,
      `The lesson I keep coming back to is that constraints are a design input. The free-tier model made me invest in retrieval. WhatsApp made me invest in conversation handling. Neither was the plan at the start, and the product is better for both.`,
    ],
  },
  {
    slug: 'frontend-skills-that-dont-get-automated',
    date: 'Dec 2025',
    readTime: '3 min',
    tag: 'Career',
    title: "The frontend skills that don't get automated",
    excerpt: 'Accessibility, testing and performance are unglamorous — and increasingly the part of the job that separates a developer from a demo.',
    body: [
      `AI tools can now produce a plausible React component in seconds. That is genuinely useful, and it also changes what is worth being good at. Generating the UI is getting cheap. Knowing whether it is actually right is not, and that is where I think accessibility, testing and performance earn their place.`,
      `Take accessibility. Generated code often looks correct while being unusable for some people: a clickable div instead of a button, an input with no label, a modal that traps nobody's focus. Sighted mouse users never notice. A keyboard or screen reader user hits a wall on the first interaction. Fixing it is usually not hard (use the right element, label the control, manage focus), but you have to know to look. No tool can tell you your interface is confusing to someone who navigates it differently from you.`,
      `Testing is the same story. A test is where you write down, in code, what correct means for this feature. I have found that testing with role- and label-based queries, the way Testing Library encourages, gives a bonus: if I can't find an element by its role or accessible name, a screen reader probably can't either. Tests written this way check behaviour rather than implementation details, so they survive refactors instead of breaking on every one.`,
      `Performance is where guessing goes to die. The habits that matter are unglamorous: measure before optimizing, give images explicit dimensions so the layout doesn't jump, ship less JavaScript, and use the browser's performance tools and Core Web Vitals to find what is actually slow rather than what feels slow. A demo can hide all of this. A real page on a mid-range phone and a weak connection can't.`,
      `What these three have in common is that they are about verification and judgment, not production. They depend on context: who uses this, on what device, with what needs. Tools will keep getting better at writing the first draft. The person who can review that draft, spot the missing label, write the test that pins down the behaviour and notice the layout shift is doing the part that still needs a human.`,
      `That is the direction I am trying to build my own habits in: not just making a page that renders, but making one I can defend. It is slower at first and it is the difference between a developer and a demo.`,
    ],
  },
];