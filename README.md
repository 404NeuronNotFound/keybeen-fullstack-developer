# Keybeen's developer portfolio

A React and TypeScript portfolio inspired by Spotify's artist pages: portrait, project discography, tool library, and a connected experience timeline. Project controls open real project information; they do not simulate audio playback. Avatar music is an optional Easter egg with explicit sound opt-in.

## Local setup

Use Node.js 22.12 or later and npm. Run `npm ci`, copy `.env.example` to `.env.local`, fill in the keys below, and run `npm run dev`. Vite prints the local URL. Never commit `.env.local`.

- `VITE_WEB3FORMS_ACCESS_KEY`: Web3Forms receiving-email access key, used by the browser to send the contact form.
- `ABSTRACT_EMAIL_VALIDATION_API_KEY`: server-only AbstractAPI Email Reputation key; never add a `VITE_` prefix. Validation runs only on Send, before message delivery.

Contact reserves a 600-second cooldown before each validation/delivery attempt, including failed attempts. The visitor cooldown uses session storage; the endpoint also limits requests and caches results within each running server instance. These controls do not provide a global spending cap across visitors or server instances. Configure provider spending limits independently. Do not use real submissions or paid validations for routine UI tests.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite development server and local email-validation endpoint |
| `npm run build` | TypeScript checks and production assets in `dist` |
| `npm run lint` | ESLint checks |
| `npm run preview` | Local production preview with the local validation middleware |

## Edit content

- `src/constants/index.ts`: identity, role, introduction, social handles, canonical website, and navigation labels. Add `SITE.resumeUrl` only when a current resume exists.
- `src/data/projects.ts`: real project status, availability, links, cover source, stack, and descriptions. Case studies remain deferred; optional case-study support is retained for later.
- `src/data/skills.ts`, `src/constants/toolBrands.ts`: skill descriptions, curated core tools, and real tool brand marks.
- `src/data/experience.ts`: roles, organization, dates, contribution copy, and icon meaning.
- `src/pages/AboutPage.tsx`: personal interests and the confirmed AI workflow.
- `src/styles/globals.css`: dark/light colors, spacing, responsive layouts, motion, and keyboard focus.
- `index.html`: canonical URL and social metadata. Keep these URLs in sync with `SITE.website`; update the preview generator if identity or host changes.

Hash URLs such as `/#projects` support direct navigation, refresh, and browser Back/Forward. The browser title follows the active page. Social crawlers receive one static site-level preview because hash fragments are not separate server routes.

## Images

Original JPEG artwork remains in `public` for editing and regeneration. Runtime images use generated WebP variants under `public/images` and the mapping in `src/data/imageManifest.ts`; small thumbnails and responsive source sets avoid downloading the full originals. Add a JPEG and rerun the generator whenever artwork changes.

Install Pillow in your Python environment (`python -m pip install Pillow`), then run `python scripts/optimize_images.py`. The script also creates `public/social-preview.jpg` (1200 x 630) and the Apple touch icon. WebP is the selected optimized format; AVIF is not required. Generated assets are committed alongside the app, so production builds do not need Python. The script falls back to a system font when Windows fonts are unavailable.

The hero portrait has high fetch priority. Other artwork loads lazily; the alternate portrait is requested when revealed. Project covers reserve square space and fall back to a vector illustration on errors. Share-card export uses a static, fixed 960 px surface, waits for fonts and decoded images, and lazy-loads html2canvas only on Download.

## Data and audio

GitHub activity uses the public [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api), requesting the last-year period. Requests have an eight-second timeout, abort on unmount, validate calendar dates/counts/levels, and cache valid data for 30 minutes in memory/session storage. Retry bypasses that cache; empty activity and service failures have distinct messages. A failed refresh preserves previously loaded data.

All interactive avatars share one YouTube controller. No iframe/API load occurs until sound is opted in and a portrait reveal requests playback. Muting cancels pending playback and silences the player. Share preview/export portraits are static and do not subscribe to audio. The sidebar's manually selected Project spotlight is descriptive; it does not claim live coding activity.

## Deployment

For Vercel, use build command `npm run build` and output directory `dist`. Configure both environment keys in the project settings, then deploy the repository. The `api/validate-email.ts` server function must be deployed with the frontend; a static `dist` upload alone cannot validate email. On another host, provide an equivalent server endpoint at `/api/validate-email` with the private key available only on the server.

After deployment, verify the canonical host, `/social-preview.jpg`, direct hash links, a share download, GitHub retry/failure feedback, theme/sound preferences, and contact delivery using an intentional test message. Local builds and mocked checks do not prove external delivery, autoplay permissions, or social-preview caching. Deploy again after changing public environment values because Vite embeds them at build time.
