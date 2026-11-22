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

## Page entrances and motion

Section navigation uses `src/utils/pageTransition.ts` and `src/styles/page-transitions.css` for a shared content-and-heading morph. Browser view-transition snapshots preserve the outgoing page while the new page restores its scroll and focus; GSAP provides a short entrance when snapshots are unavailable. The sidebar, topbar, and project bar stay in place. Rapid navigation settles any pending selection before computing history; destination history snapshots are saved after their state commits. Page-specific entrances and reveals yield to the shared transition. Reduced motion, the startup intro, and open native dialogs bypass the route morph.

`PortfolioEntry` in `src/components/layout/PortfolioEntry.tsx` presents a roughly three-second portrait-record and name entrance before Home. A scanning binary/code backdrop and green GSAP sweep sit behind the spinning vinyl; its center keeps the original photo. `IntroCodeScan` caches the background, throttles drawing, and stops when the tab is hidden or the intro unmounts. The intro measures Home after mounting, then carries floating portrait/name copies into their Home positions. Home's separate hero entrance is suppressed during this handoff. Copies and temporary styles are cleaned up on completion or Skip. It plays once per tab session, offers Skip and Escape, respects reduced motion, and bypasses direct links to other sections. A five-second fallback prevents the intro from blocking entry. Add `?intro=1` to the Home URL to replay it from the top for review; reduced motion still takes precedence.

The home page uses GSAP and `@gsap/react` for its coordinated artist-profile entrance and scroll reveals. `src/hooks/useHomeMotion.ts` scopes animations to Home and uses `.app-content` as the scroll container. A resize observer refreshes trigger positions when contribution data changes the layout. Context cleanup removes animations and triggers when leaving Home.

Reduced-motion preferences disable entrances and scroll reveals while keeping all content and project actions available. Framer Motion retains control of existing card hover interactions.

Scroll reveals start their GSAP tween only after entering view, so waiting for a trigger never hides content. The contribution calendar is kept outside reveal animations so loading, cached data, and errors remain visible on reload.

`src/hooks/useCalendarMotion.ts` gives loaded calendar weeks a short left-to-right wave and gently lifts the contribution stats. It starts only when data is ready and the card is in view, never hides the calendar wrapper, and respects reduced motion. Week columns are animated as groups rather than hundreds of individual cells.

About uses `src/styles/about.css` for its portrait, workflow, and personal-interest layout. `src/hooks/useAboutMotion.ts` adds a scoped entrance, section reveals, and a scroll-driven workflow line inside the app's main scroller. Motion respects reduced-motion preferences, completes when a control receives keyboard focus, and cleans up when leaving About. The editing-work link uses the existing video portfolio URL in project data.

The Skills page is a single wide photo scene with the original eyebrow, ?Tools of the trade.? heading, and description at the top-left. An SVG silhouette reuses the same responsive photo at the sphere?s middle depth: rear cards pass behind the seated person, while front cards pass in front. Its original-coordinate clip path uses the same bottom-aligned cover sizing as the background; pointer hits are blocked only within the silhouette. `SkillOrbitScene` puts every tool from `src/data/skills.ts` into a compact glass card on a Fibonacci sphere. `src/utils/skillSphere.ts` rotates points around a fixed tilted axis and projects them into a wider orbit with separate horizontal and vertical extents to keep all 19 cards spaced apart. Smaller rear cards recede more strongly. Depth controls card size, opacity, and stacking around the silhouette. The sphere center follows the seated figure as the cover image crops. GSAP completes one smooth revolution in 70 seconds, with gentle pointer steering. Hover and keyboard focus pause the sphere; keyboard selection turns the sphere toward the tool without overriding its depth. Cards open related projects; tools without project evidence show their descriptions in native popovers. Off-screen and hidden-tab states pause rotation, and reduced motion keeps a static sphere. The former header, library, filters, and footer are removed. The AI-extended dock photo uses 287 KB / 106 KB JPEG variants; its source and prompt are preserved in `output/imagegen/skills-dock-wide-*`.

Experience keeps a single-open accordion with a date column on wider content containers. `src/styles/experience.css` defines the timeline, while `src/hooks/useExperienceMotion.ts` adds deferred entry reveals, a scroll-driven rail, and short detail entrances. Resize refreshes wait for expansion to settle; reduced motion bypasses the animations. Related-project buttons are limited to work named in the corresponding history entry.

Projects uses `src/styles/projects.css` for a responsive album grid consistent with the rest of the portfolio. Its cards include category, year, and a short stack summary. `src/hooks/useProjectsMotion.ts` adds a brief header entrance and deferred card reveals, rebuilding the reveals when filters change. Scrolling stays native, and every card remains in normal document flow. Reduced-motion preferences disable the animations; keyboard focus completes a pending reveal.

Contact uses `src/styles/contact.css` for direct email, social links, and a responsive message form. `src/hooks/useContactMotion.ts` adds a short entrance and deferred secondary-section reveals; focusing a control completes the entrance immediately. The existing email validation, cooldown, honeypot, delivery checks, retry feedback, and failure preservation remain in place. Routine verification must mock submissions and email checks.

`src/hooks/useModalMorph.ts` opens the native project and share dialogs with a short source-to-panel transform. A project card's cover can bridge into the modal artwork using an inert copy inside the dialog's top layer. The native dialog retains focus trapping, Escape, and focus return; interaction, scrolling, resizing, reduced-motion changes, and close all settle or clean up the animation. Share exports stay outside the animated preview surface.

## Images

About's portrait uses `public/images/about-portrait-pixels.png` as a monochrome source for `InteractiveCodePortrait` and `src/utils/codePortrait.ts`. Bolder binary digits and code symbols form the face. A repeating scan and staggered character shuffles continuously rebuild the portrait while keeping its silhouette visible. Hover adds local scrambling; click/tap or keyboard activation sends a ripple. Character sprites and the dim background are cached, and ambient drawing runs at about 11 Hz. The artwork has no visible interaction hints or playback controls; off-screen and hidden-tab states stop its loop automatically. Reduced motion keeps a static code portrait; unavailable canvas keeps the source artwork. The original photo remains at `public/images/about-portrait.jpeg`; other portraits are unchanged.

Original JPEG artwork remains in `public` for editing and regeneration. Runtime images use generated WebP variants under `public/images` and the mapping in `src/data/imageManifest.ts`; small thumbnails and responsive source sets avoid downloading the full originals. Add a JPEG and rerun the generator whenever artwork changes.

Install Pillow in your Python environment (`python -m pip install Pillow`), then run `python scripts/optimize_images.py`. The script also creates `public/social-preview.jpg` (1200 x 630) and the Apple touch icon. WebP is the selected optimized format; AVIF is not required. Generated assets are committed alongside the app, so production builds do not need Python. The script falls back to a system font when Windows fonts are unavailable.

The hero portrait has high fetch priority. Other artwork loads lazily; the alternate portrait is requested when revealed. Project covers reserve square space and fall back to a vector illustration on errors. Share-card export uses a static, fixed 960 px surface, waits for fonts and decoded images, and lazy-loads html2canvas only on Download.

## Data and audio

GitHub activity uses the public [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api), requesting the last-year period. Requests have an eight-second timeout, abort on unmount, validate calendar dates/counts/levels, and cache valid data for 30 minutes in memory/session storage. Retry bypasses that cache; empty activity and service failures have distinct messages. A failed refresh preserves previously loaded data.

All interactive avatars share one YouTube controller. No iframe/API load occurs until sound is opted in and a portrait reveal requests playback. Muting cancels pending playback and silences the player. Share preview/export portraits are static and do not subscribe to audio. The sidebar's manually selected Project spotlight is descriptive; it does not claim live coding activity.

## Deployment

For Vercel, use build command `npm run build` and output directory `dist`. Configure both environment keys in the project settings, then deploy the repository. The `api/validate-email.ts` server function must be deployed with the frontend; a static `dist` upload alone cannot validate email. On another host, provide an equivalent server endpoint at `/api/validate-email` with the private key available only on the server.

After deployment, verify the canonical host, `/social-preview.jpg`, direct hash links, a share download, GitHub retry/failure feedback, theme/sound preferences, and contact delivery using an intentional test message. Local builds and mocked checks do not prove external delivery, autoplay permissions, or social-preview caching. Deploy again after changing public environment values because Vite embeds them at build time.
