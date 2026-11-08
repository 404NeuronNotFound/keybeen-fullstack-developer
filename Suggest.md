# Portfolio suggestions and bug review

Reviewed: October 6, 2026.

Goal: make Keybeen's portfolio cooler, more personal, and more artistic while keeping its Spotify-inspired identity.

Status key: 🟢 Done = implemented. Unchecked suggestions are still open. Any remaining delivery or visual checks are labeled separately.

## Review scope and results

- Reviewed all six pages, layout components, project and skill data, navigation/player/theme/sound stores, audio hooks, sharing, GitHub activity, global styles, and public assets.
- `npm run build`: passed, including TypeScript compilation. The first attempt hit a sandbox subprocess restriction; the approved rerun passed. This was an environment limitation, not a portfolio build bug.
- `npm run lint`: failed with six errors, listed below.
- Browser inspection was attempted using the browser skill, but no browser was available. Findings below are based on code and build/lint output. Layout risks are explicitly marked as needing visual verification; external repositories and live services were not checked.
- The original review proposed changes. The contact form implementation below was added afterward; the other suggestions remain open.

## Keep the existing identity

- Keep the dark charcoal surfaces, green primary actions, artist-style hero, desktop library/sidebar, track lists, album covers, and mobile mini-player.
- Keep your real portrait, alter-ego reveal, comic speech bubble, local project ideas, and relaxed writing. These are the strongest personal details already present.
- Give the music metaphor a clear purpose: projects are releases, skills are frequently used tools, and experience is your journey. Make each action useful to someone assessing your work.
- Use personal touches sparingly: a hand-drawn underline, a small sticker on a cover, a note from your sketchbook, or subtle print texture. Keep text and navigation clean and readable.
- Use green for actions and active states. Let project artwork carry other colors so the whole interface stays coherent.

## Bugs and functional gaps

Priority: P1 = fix first; P2 = next pass; P3 = smaller consistency issue. “Code-confirmed” means the relevant behavior follows directly from the implementation, without claiming browser reproduction.

### 🟢 Done — P1 contact form: Web3Forms integration

**Still pending:** verify actual inbox delivery and check the layout in a browser.

**What was wrong, in plain language:** The old Send button was like pressing a doorbell that was not connected to anything. It displayed “Sent,” but your message never left the page.

**🟢 What changed:** The form now sends the visitor's name, email address, and message to Web3Forms. Web3Forms is the service that forwards the message to the inbox connected to your access key. The visitor's email is included so you can reply to them. This follows the [official Web3Forms API guide](https://docs.web3forms.com/getting-started/api-reference).

1. Visitors fill in three clearly labeled boxes: name, email, and message. Empty fields and invalid email addresses are checked before sending.
2. The button displays “Sending…” while the request is running. The fields and button are temporarily disabled, and a second submit is blocked, so visitors cannot accidentally send several copies at once.
3. The page shows a green “Message sent!” toast only when Web3Forms returns both a successful HTTP response and `success: true`. Visitors see a friendly thank-you and an explanation that you will reply by email. The service name stays out of the visitor-facing text. This confirms the service accepted the message; actual inbox arrival still needs the delivery check below.
4. If the request fails, is rejected, takes too long, or hits a sending limit, the page explains the problem. The visitor's text stays in the boxes so they can retry or use your email link.
5. After a confirmed success, the fields are cleared for another message. Keyboard users can submit the form normally, and assistive tools can announce the result.
6. A hidden checkbox helps catch simple spam bots. It is a basic extra check, not a guarantee that all spam will be blocked.

**Access key setup and what remains:** Your supplied key has been saved in `.env.local`, which Git ignores. Local configuration is complete. The steps below explain how that setting works and how to finish deployment and delivery verification:

1. Go to [Web3Forms](https://web3forms.com/) and create an access key using the inbox where you want to receive messages, such as `keybeen.webdeveloper@gmail.com`. Follow any email verification steps they show.
2. Copy `.env.example` to `.env.local` inside the `myDevPortfolio` folder. It should contain:

   ```env
   VITE_WEB3FORMS_ACCESS_KEY=paste_your_actual_key_here
   ```

3. Restart your development server. This setting is read when Vite starts. `.env.local` is already ignored by Git because `.gitignore` excludes `*.local`.
4. When deploying, add the same variable in your hosting project's environment settings and rebuild/redeploy. For this project, that means configuring it in Vercel if that is still your host.
5. Send a real test message through the browser and check your inbox and spam folder. The earlier automated checks used fake responses and sent no email. Actual inbox delivery has not been verified.

Think of the access key as the address label that tells Web3Forms which inbox should receive the message. It is a browser-facing form key, so using an environment setting does not hide it from visitors once the site is built. Do not put an email password here. Without the key, submission shows a clear error instead of fake success.

**Files changed:** `src/pages/ContactPage.tsx` contains the visible form and sending states. `src/utils/contactSubmission.ts` handles the Web3Forms request and checks its answer, with a 20-second timeout. `.env.example` shows the setting to configure. The Spotify colors, rounded button, and contact links are retained.

**Verification results:** All 8 automated checks passed before the test file was removed at your request. They covered success, a missing key, rejection, HTTP failure, rate limiting, network failure, timeout, and invalid response data. The production build passed with `npm run build`, and the changed source files passed the focused lint check `npx eslint src/pages/ContactPage.tsx src/utils/contactSubmission.ts`. Actual inbox delivery and browser layout still need a check with your configured key. The original six lint errors elsewhere in the project are a separate open item.

**🟢 Done — Friendlier feedback across the site:** A toast is a small message card that appears over the page without stopping what the visitor is doing. Contact success and errors now use the same shared toast as profile-link copying and card-download feedback. It uses the portfolio's dark surfaces, green success accent, and a warm amber accent for errors. On phones it fits between the screen edges with a little padding; on wide screens it stays compact near the top right. Its height is limited so long messages can scroll without covering the player and navigation. The card has a large close button, text that wraps, screen-reader announcements, and no entry animation when reduced motion is preferred.

Success and information messages close after seven seconds. Hovering or focusing the card pauses automatic dismissal. Errors stay until the visitor closes them; pressing Escape while focused inside a toast also closes it. A new contact submission clears its previous toast. Up to three messages can be shown at once. Your typed message stays in the form after an error.

For future features, use `toast.success({ title: 'Done!', description: 'A short explanation.' })`, `toast.error({ title: 'Something went wrong', description: 'Explain what the visitor can do next.' })`, or `toast.info({ title: 'Good to know', description: 'Helpful context.' })` from `src/store/toastStore.ts`. Think of this as one reusable message-card design: each feature supplies its words, and `src/components/ui/ToastViewport.tsx` handles displaying it. `App.tsx` mounts that display once for the whole portfolio. No new Markdown document was created.

**Toast update checks:** The production build and TypeScript check passed. Focused lint passed for ContactPage, ToastViewport, ShareCard, toastStore, and App. All 8 submission checks passed before the test file was removed. Responsive styles are implemented, but a visual phone/desktop check remains pending because no in-app browser was available in this session.

### 🟢 Done - Contact check-on-Send and session cooldown

- [x] 🟢 Restore the previous Gmail contact card and remove Copy email/Open email controls.
- [x] 🟢 Check the email's syntax locally while editing, with no provider requests on typing, pauses, or blur.
- [x] 🟢 On Send, reserve the 600-second session cooldown, then ask the private AbstractAPI endpoint for deliverability. Submit the Web3Forms message only if the returned address matches and its verdict is valid. Block invalid, typo, uncertain, or unavailable results; retain the visitor's form details.
- [x] 🟢 Keep the cooldown for failed verification or send attempts as well, preventing repeated paid checks through the app. Persist its expiry in sessionStorage, show a countdown, and disable form controls until it expires.
- [x] 🟢 Restore the private server-only AbstractAPI key setting and local Vite middleware. Use bounded ten-minute result caching and a per-IP ten-minute request guard in the server instance. Method, origin, JSON, format, body-size, response-address, and timeout checks remain enforced.

**User clarification:** The owner wants actual email deliverability checking as well as the 600-second resend cooldown. This supersedes the previous removal of AbstractAPI. Check only when Send is clicked to avoid spending credits on email edits or blur events. A deliverability verdict is a provider assessment, not a guarantee of future delivery. Provider response interpretation follows https://docs.abstractapi.com/api/email-reputation; the server client-address header follows https://vercel.com/docs/headers/request-headers.

**Checks before marking done:** TypeScript/production build, ESLint, and executable checks passed. Tests covered verification before message delivery, valid/invalid/typo/uncertain/unavailable responses, no requests from email edits or blur, cooldown across failures and reloads, server IP cooldown/expiry, cached verdicts, and request guards. Requests were mocked: no real messages or paid lookups were sent during verification.

**Scope:** Browser cooldown is per tab session. Server cooldown and cache are held in each running instance, so separate serverless instances or restarts do not share them. These reduce repeated requests but do not establish a global spending cap or durable distributed anti-spam limit.

**Deployment:** Keep ABSTRACT_EMAIL_VALIDATION_API_KEY server-only; never use a VITE_ prefix. Redeploy the app and API handler to activate the revised behavior. Browser visual verification remains pending.

### 🟢 Done — P1 topbar navigation arrows subscribe to history changes

- **What was wrong:** Topbar subscribed to stable `canBack` and `canForward` functions instead of their boolean results. Parent rerenders could make the arrows appear to work, but Topbar itself did not react to history changes.
- **What changed:** `src/components/layout/Topbar.tsx` now selects `s.histIdx > 0` and `s.histIdx < s.history.length - 1` directly, so the arrows update when their enabled states change.
- **Checks completed:** Temporary automated store checks passed for Home → About, Back, Forward, immediate subscription updates, and navigating after Back clearing the forward branch. Focused Topbar lint and the TypeScript/production build passed; the build required an approved rerun after a sandbox subprocess restriction. No test file was added. Visual browser verification remains pending.

### 🟢 Done — P1 hero action opens a project overview

- **Confirmed bug:** The hero button called `play(currentTrack)` even when its label and icon said Pause, so clicking it while playing could not pause progress.
- **Current behavior:** As part of the project-reader change below, `src/components/sections/HeroSection.tsx` now opens the selected project's overview. Its book icon and accessible label match that action.
- **Checks completed:** Temporary automated checks executed the actual hero handler with the real project-reader store and confirmed that it opens the overview. TypeScript, the production build, and full-project lint passed. No test file was added. Visual browser verification remains pending.

### 🟢 Done — P1 avatar music respects sound opt-in and mute

- **Confirmed bug:** Each avatar initialized a YouTube player on mount and scheduled music without checking the sound preference. Muting did not stop that player.
- **What changed:** All avatars now share one lazily initialized YouTube player. The speaker button opts into both hover sounds and avatar music for the current visit; a saved unmuted preference alone does not start sound or load YouTube. Its accessible label names both sounds and music. Opt-in is kept out of persisted storage.
- **Mute and cleanup:** Muting immediately issues mute/pause commands and cancels delayed or pending playback. Late player readiness and playback events recheck permission. Leaving an avatar or unmounting its active instance cancels its music; an unrelated avatar cannot stop the current owner's playback. The player is destroyed when the last avatar unmounts. Unmuting alone does not resume a canceled hover request.
- **Checks completed:** Temporary automated checks used the actual audio hook and sound store with a simulated YouTube player, controlled timers, and saved settings. They confirmed fresh opt-in, no YouTube loading on muted hover, cancellation during the hover delay/API loading/player readiness, immediate mute/pause commands, suppression of late playback, one shared player, ownership, and unmount cleanup. Actual Avatar hover/leave handler wiring was also checked. Focused lint for all five changed source files, TypeScript, and the production build passed. No test file was added.
- **Still pending — real browser audio:** No in-app browser was available. Audible playback after speaker-button opt-in and audible silence when muting must still be checked in a browser, since its autoplay rules can block YouTube playback. The automated checks confirm controller behavior, not actual sound output.

### 🟢 Done — P2 project reader replaces simulated playback

- **Confirmed bug:** The old player advanced an artificial timer and exposed seek, volume, shuffle, and repeat controls without a connected media source. Its progress speed also ignored project duration.
- **Chosen behavior:** Following the recommended project-reading direction you approved, the hero and bottom bar now open an actual project overview. The reader uses existing descriptions, technologies, and years; it does not invent walkthrough videos or completed case studies. Its three sections are Overview, Technologies, and Next steps, with a clearly labeled section count.
- **What changed:** `src/store/projectReaderStore.ts` replaces the old player store. `src/components/layout/ProjectBar.tsx` replaces the playbar, and `src/components/ui/ProjectOverview.tsx` displays the reader. Play/Pause, seek, volume, shuffle, repeat, elapsed time, and playback timers were removed. The unrelated simulated progress strip in Sidebar was also removed. Avatar music continues to use the speaker opt-in/mute control.
- **Navigation and completion:** Visitors choose sections manually. Reopening from the hero or bottom bar retains the selected project's section. Explicitly opening a card/list item's details starts at Overview. Choosing another project resets to Overview. Previous/next project controls are disabled at the first/last project, so there is no automatic looping. Done closes the final section; its Next steps actions open Contact or Projects. The native modal dialog provides browser focus containment and Escape dismissal, with labeled controls, visible focus styles, wrapping section buttons, and a scrollable layout.
- **Checks completed:** Temporary automated checks executed the real store and actual hero, desktop/mobile bar, and reader handlers. They confirmed opening, closing, cancel handling, section selection, completion, resume, project boundary behavior, section reset when changing projects, content/technology rendering, and Contact/Projects navigation. Simulated dialog effects confirmed show/close calls. No playback timer or media controls remain in the active reader. TypeScript, `npm run build`, full `npm run lint`, and diff checks passed. No test file was added.
- **Still pending — visual/browser check:** No in-app browser was available. Responsive appearance, native focus containment/restoration, and physical Escape/Tab interactions still need browser verification; the automated checks confirm state and handler behavior.

### 🟢 Done — P2 incorrect and placeholder project links are hidden

- **Confirmed bug:** PowerAtomic reused the video-editing project's repository URL. The popover rendered repository links unconditionally and could expose `live: '#'` as a demo action for unlocked projects.
- **What changed:** Removed PowerAtomic's incorrect repository value and all seven placeholder demo values in `src/data/projects.ts`. Repository and demo URLs are now optional in the Project type. `ProjectPopover.tsx` renders these actions only for absolute HTTP/HTTPS URLs, using `getProjectUrl` from `src/utils/index.ts`. Each icon link has an accessible name identifying its project and action. PowerAtomic's repository action stays hidden until its actual URL is supplied.
- **Checks completed:** Temporary automated checks rendered the actual popover for all seven projects in locked/unlocked states. They confirmed that PowerAtomic exposes no repository link, project 6 retains its own repository link, and unavailable demos are hidden. Valid future demo URLs render correctly; empty, relative, placeholder, and unsupported URLs remain hidden. Remaining repository actions match their configured URLs, with separate accessible labels and safe new-tab attributes. TypeScript, focused lint, the production build, and diff checks passed. No test file was added.
- **External verification limit:** Attempts to fetch the six remaining GitHub repository pages failed. Their public existence/access and live destinations are not confirmed by these rendering checks. No replacement repository URL was guessed.

### 🟢 Done — P2 project details have explicit keyboard/touch controls

- **Confirmed bug:** The teaser cards had no focusable detail trigger, and project repository links were available only in a hover popover.
- **What changed:** `TeaserCard.tsx` and `ProjectCard.tsx` now have always-visible native View details buttons. `TeaserRow.tsx` makes each project title a native detail button, so the Home list also opens the reader. Controls have project-specific accessible names, dialog semantics, visible focus outlines, and a minimum 44 px height. Hover previews remain an optional shortcut.
- **Reader behavior:** Every detail trigger selects its own project and opens Overview, including when reopening the same project. The native modal displays its description and available repository/demo links with visible text and project-specific accessible names. Missing/placeholder links remain hidden, including PowerAtomic's unavailable repository. Closing via the close button or Escape uses the existing native-dialog behavior. Detail clicks in ProjectCard stop propagation so its parent action cannot run accidentally.
- **Checks completed:** Temporary automated checks executed all 21 actual triggers (both card variants plus list rows for all seven projects) with the real reader store. They confirmed enabled native buttons in the normal tab order, dialog labels, correct project/description selection, reset to Overview, available link targets/names, placeholder filtering, close behavior, and isolation from the parent action. Generic hero/bottom-bar reopening still preserves the reading section. TypeScript, focused lint, the production build, and diff checks passed. No test file was added.
- **Still pending — physical browser interaction:** No in-app browser was available. Actual Tab/Enter navigation, touch taps, focus containment/restoration, and responsive appearance remain untested in a browser. The automated checks confirm rendered controls and their click actions; native buttons provide keyboard activation without custom key handlers.

### 🟢 Done — P2 inaccessible seek/volume controls removed

- **Confirmed resolution:** The approved project-reader replacement removed seek and volume from the visitor interface. Project reading now uses labeled native buttons to select projects and sections, so adjustable media sliders are no longer needed.
- **Cleanup:** Confirmed that `ProgressBar.tsx` had no consumers, then removed the unused clickable-div component and its UI export. This eliminates the leftover inaccessible implementation.
- **Checks completed:** Source searches found no remaining ProgressBar references, old player store/volume actions, playback timer constants, or clickable progressbar controls. TypeScript, focused lint for the changed UI export, the production build, and diff checks passed. No test file was added. Seek/volume keyboard and touch checks are no longer applicable because those controls are absent; physical browser testing of the reader's buttons remains pending as documented above.

### 🟢 Done — P2 Share uses a keyboard-accessible native dialog

- **Confirmed bug:** Share was a plain overlay without dialog semantics, focus containment, Escape handling, or focus restoration.
- **What changed:** `src/components/ui/ShareCard.tsx` now opens a native modal dialog using `showModal()`, with a labeled title and description. Its Close button receives initial focus. The browser handles Tab containment and makes the background inactive. Escape, Close, and backdrop clicks dismiss the dialog; clicks inside its bounds do not dismiss it. Background scrolling is locked while open and restored on cleanup.
- **Share trigger and focus:** `HeroSection.tsx` identifies Share as a dialog trigger and passes its button reference to the modal. Closing restores focus to that Share button without scrolling; other callers fall back to the previously focused element. Close, Copy link, and Download card are native buttons with visible keyboard focus outlines. The Close target is 44 px.
- **Accessible feedback:** Copy/download success, preparation, and errors are also displayed in a live status region inside the dialog, where they remain available while the background toast area is inactive. Repeated copies replace the previous reset timer, and closing cleans up that timer.
- **Opening regression fixed:** React development Strict Mode runs opening-effect setup, cleanup, then setup again. Cleanup queued a native close event that previously dismissed the reopened Share modal. The close handler now dismisses only when the dialog is still closed. A temporary regression check reproduced the unwanted dismissal before the fix and confirmed that Strict Mode replay and repeated opening keep the dialog open afterward. Real close and Escape still work, and focus/scroll restoration remain intact. The earlier copy/download checks, TypeScript, focused lint, and production build passed again.
- **Checks completed:** Temporary automated checks executed the actual modal handlers and effects using simulated DOM/clipboard/canvas APIs. They confirmed native-dialog labels, opening, the initial autofocus target, normally focusable action buttons, copy/download success and failure feedback, Escape/cancel, Close, backdrop versus inside clicks, scroll restoration, explicit/fallback focus restoration, and timer cleanup. TypeScript, focused lint, the production build, and diff checks passed. These checks did not write to the real clipboard or download a file. No test file was added.
- **Still pending — physical browser check:** No in-app browser was available. A real keyboard open → Tab through Copy/Download → activate → Escape/Close sequence, native Tab containment, focus restoration, and responsive appearance remain unverified in a browser. The automated checks confirm implementation behavior, not physical browser interactions.

### 🟢 Done — P2 saved theme loading is safe and the toggle is available

- **Confirmed bug:** `themeStore.ts` read and parsed localStorage outside error handling during module initialization. Corrupt JSON or blocked storage could stop startup. Topbar's theme control was commented out.
- **What changed:** The theme store reads the saved preference once inside guarded code, accepts only `dark` or `light`, and falls back to dark for missing, malformed, unsupported, or inaccessible values. It applies the validated theme before React mounts. Browser/document access is guarded so importing without a browser is also safe.
- **Saving and switching:** Theme changes update the store and page immediately, then attempt to save using the existing `keybeen-theme` JSON format. Failed writes leave switching usable in memory. Topbar now exposes a native theme button with a label describing the next mode, a 44 px target, and a visible keyboard focus outline. Valid saved light themes can be switched back to dark.
- **Checks completed:** Temporary automated checks executed the actual theme store across 19 saved-data/storage cases, including corrupt JSON, missing/null/primitive data, unsupported theme values, valid dark/light preferences, blocked reads, a throwing localStorage getter, and failed writes. They confirmed safe fallback, HTML theme application, preference reloads, and in-memory switching after storage failure. Importing/toggling without browser globals also passed. Actual Topbar handler checks confirmed light → dark → light and updated button labels. TypeScript, focused lint, the production build, and diff checks passed. No test file was added.
- **Still pending — visual browser check:** No in-app browser was available. Physical keyboard/touch interaction and the appearance of both modes remain unverified in a browser. The component palette pass below is implemented; visual confirmation remains pending.

### 🟢 Done — Light-theme palette and component consistency

- **What changed:** Light mode now uses a soft off-white page, warm pale cards, charcoal text, deeper green accents, and lighter shadows/backdrops. Primary green actions use white foregrounds in light mode and the existing dark foregrounds in dark mode. Shared tokens cover navigation controls, hover surfaces, borders, tags, contact icons, warnings, artwork icons, hero tint, and heatmap shades.
- **Component fixes:** Removed hardcoded dark hover surfaces from About and Sidebar, corrected pale-gradient icons in Skills/Experience, softened skill tracks and tags, and made Contact fields/icons readable. Share's dialog and card preview now follow the selected theme, with the QR code retaining its black/white rendering. Project cards, list rows, and pinned entries no longer fade their text in light mode; equal card sizing and aligned detail buttons remain in place.
- **Checks completed:** All theme color references resolve to defined variables. Thirteen main light-theme text/button pairs passed a calculated 4.5:1 contrast check, with the lowest at 4.82:1. These measurements cover the main foreground, secondary text, and green text on page/sidebar/card/raised surfaces, plus primary button text. TypeScript, full-project lint, and the production build passed. No test file was added.
- **Still pending — visual QA:** No in-app browser was available. Actual appearance at phone/desktop sizes, composite gradients/overlays, and exported Share PNG appearance still need browser inspection. The measured color pairs do not establish full-site accessibility or visually verify every component.

### 🟢 Done — P2 GitHub calendar dates stay consistent across timezones

- **Confirmed:** Date-only contribution values were combined with local weekday/month accessors and local date formatting, allowing dates to shift for visitors west of UTC.
- **Fixed:** `ContributionHeatmap.tsx` uses UTC weekday/month accessors and UTC tooltip formatting. `formatShortDate` also formats in UTC, keeping best-day labels consistent. `GithubActivitySection.tsx` labels totals as the last 12 months and longest streak as “in this period.”
- **Verified:** 50 actual component renders covering mobile/desktop grids, leap day, month/year boundaries, and a US daylight-saving date produced identical calendar positions, month labels, and tooltip dates in `Asia/Manila`, `Asia/Shanghai`, `America/Los_Angeles`, `America/New_York`, and `UTC`. Empty input, best-day formatting, and period labels also passed. TypeScript, focused ESLint, and the production build passed; no test files were added.
- **Browser limitation:** No in-app browser was available for visual inspection; timezone behavior was verified with component render checks.

### 🟢 Done — P2 popover links stay available across the pointer gap

- **Confirmed and fixed:** `ProjectPopover.tsx` closed immediately across its 12 px gap. It now waits 240 ms before closing, cancels that timer on preview entry/focus, and clears both open/close timers on unmount. Focused preview links remain available; Escape and page scrolling dismiss the preview.
- **Placement:** The preview renders into `document.body` to avoid card/scroll-container clipping. It measures its actual dimensions, chooses above/below using available space, clamps both axes to viewport margins, and repositions on resize/content size changes. Tall previews scroll internally; width and height are constrained to the viewport. Existing “View details” buttons remain available for keyboard/touch access.
- **Verified:** In-memory checks of the actual component passed delayed open/close, gap crossing, preview re-entry, focused links, leaving before opening, scroll/Escape dismissal, resize/size observation, and pending timer/listener cleanup. 54 placement cases passed across phone/desktop dimensions, different content heights, and viewport edges. TypeScript, focused ESLint, and the production build passed. No test files were added.
- **User confirmation:** After reviewing the fix, the user confirmed “it's good.” Marked done based on that confirmation and the checks above; no automated browser inspection was performed.

### 🟢 Done — P2 full-project lint passes

- The shared avatar-audio implementation added typed YouTube interfaces and documented error handling. The project-reader change removed the old player store and its unused-expression errors.
- **Confirmed:** `npm run lint` reports zero errors, and `npm run build` passes, including TypeScript compilation.

### 🟢 Done — P3 controls, navigation, and data match available features

- **Profile and project actions:** Removed the inactive profile pill's dropdown chevron, pointer cursor, and redundant hover handlers. Avatars retain their hover effect with a default cursor. Renamed the Projects Contact action to “Ask about a project.”
- **Navigation:** Active-page navigation is ignored. All six pages have hash URLs (e.g. `#/projects`); direct links and refresh select the requested page. Native Back/Forward and topbar arrows share browser history. Navigation after Back clears the forward branch. Validated history snapshots preserve the timeline across refresh, including Forward after refreshing a previous entry. Unknown routes fall back to Home. Page-specific main scroll positions restore before paint; history/listener cleanup supports React Strict Mode.
- **Data:** Matched the skill icon key to `DevTools`. Contact, Share, and social URLs use shared Instagram/GitHub/TikTok usernames. Each experience entry declares its icon; the internship uses Monitor and the capstone uses GraduationCap, independent of array order.
- **Verified:** In-memory checks using the actual navigation store passed six direct routes, duplicate prevention, refresh, native/internal Back/Forward, forward-branch replacement, manual/invalid hashes, malformed history state, per-page scroll, duplicate browser-event handling, listener cleanup, and server fallback. Actual component render checks passed the Contact action, profile cues, social handles/URLs, DevTools icons, reordered experience icons, and App scroll restoration/recording. TypeScript, full-project ESLint, the production build, and diff checks passed. No test files were added.
- **Browser limitation:** No in-app browser was available. Native history events were simulated and component effects/render output checked; physical browser interaction and visual scroll behavior were not inspected.

## 🟢 Done — Responsive and visual fixes

The code constraints below were confirmed and fixed. Component/handler checks and CSS structure checks passed. After reviewing the changes, the user confirmed “it's good”; marked done based on that confirmation and the checks below. No automated browser inspection was performed.

- **Hero actions implemented:** Shared gutters, a wrapping desktop row, and a two-column mobile grid keep all four actions available. The green “Read projects” action has a visible label; Share becomes a compact labeled icon button on phones. Primary text and stats can wrap. Open-project, Contact, and Share actions passed component checks.
- **Page padding implemented:** Projects, Skills, and Experience now use `.page`. Home sections and Hero use the same gutter variables. Gutters switch from 32 px to 16 px on mobile and account for landscape safe-area side insets.
- **Skill tabs implemented:** Compact, non-shrinking pills scroll horizontally inside their container, keep 44 px interaction height and focus outlines, and announce the selected category. All three filter actions passed checks.
- **Bottom navigation implemented:** Removed the fixed total height. Minimum height includes the bottom inset plus border; each control retains a 56 px minimum height. Side insets and wrapping labels are supported. All six controls and inset accounting at 0/20/34 px passed structural checks. Notched-phone and landscape appearance still need inspection.
- **Experience panels implemented:** Removed the 320 px cap and clipping/height animation. Open panels grow naturally; closed panels use `hidden`, with matching expansion state and control IDs. Every entry passed expand/collapse checks.
- **Featured heading implemented:** The heading, badge, and action can wrap, while “See all” keeps its interaction height and cannot shrink away. Card grids also allow columns narrower than 175 px when available space requires it.
- **Project names implemented:** All seven projects have short names and explanatory subtitles. Cards and list rows display them without title truncation, while details and accessible action names keep full formal titles. Pinned projects and the reader summary use short names too. Fourteen card renders and all seven detail headings passed checks; equal grid rows and aligned detail buttons are retained.
- **Share card implemented:** Portrait/role, skills/QR, and social rows wrap naturally. Website text can break within the available width; dialog actions can wrap. PNG download clones the card into a stable 480 px layout with 32 px inner padding and 2× rendering, leaving the live preview unchanged. Copy/download handlers and clone configuration passed checks; actual PNG pixels have not been inspected.
- **🟢 Light-theme consistency implemented:** Shared colors now cover inputs, hover surfaces, icons, cards, navigation, and dialogs, with a softer pale palette and readable green accents. See the light-theme palette pass above for contrast/build checks. Visual verification remains pending.

**Validation:** TypeScript, full-project ESLint, production build, and diff checks passed. Temporary in-memory component/handler checks and parsed CSS checks passed; no test files were added. No in-app browser was available. Independent visual coverage was not established for 320/360/390 px and zoom, notched phones/landscape, long experience content with enlarged text, light/dark layouts, or downloaded Share PNGs; the user's confirmation does not specify individual devices or scenarios.

## Design suggestions: cooler, personal, and consistently Spotify-inspired

### 🟢 Done — Home and topbar

- [x] **Topbar title:** The active page's name appears on desktop and mobile, with polite announcement on changes. The existing 32 px circular history controls remain. Topbar height now accommodates its 44 px controls.
- [x] **Useful profile options:** Native disclosure popover includes About, Contact, resume, and shared sound preference. The user explicitly chose “Request resume” → Contact because no resume file exists. A download appears only when `SITE.resumeUrl` is supplied. Action, expanded-state, focus-return calls, and sound-toggle checks passed; native Tab/Escape/outside dismissal still needs browser inspection.
- [x] **Hero role and audience:** The shared role is visible above “I build practical web and mobile apps for schools, small shops, and everyday problems,” matching the school, shop-ledger, and personal-tool projects in the data.
- [x] **Truthful badge:** “Independent developer” replaces “Verified Developer.” Restored the decorative check badge at the user's request.
- [x] **Portrait Easter egg:** A labeled native button supports hover, keyboard focus, tap/keyboard toggle, blur cleanup, and Escape. Reduced-motion mode reveals instantly with no glitch/flash layers or glitch sound; the note bubble also skips its spring animation. At the user's request, restored the original desktop note anchor (32% from the portrait's left edge), 15 px text, 18/24 px padding, and 260 px maximum width. The mobile note remains centered and viewport-constrained. Avatar music still uses the existing opt-in/mute controller.
- [x] **Personal note:** Added the data-backed note “Based in Cagayan de Oro. My coding journey started with a simple ‘Hello, World!’” rather than inventing a current-week update.
- [x] **User-preferred Home order:** Removed the large Grades Management spotlight after the user rejected that layout. Restored GitHub activity above “Featured projects” and all three featured cards (Grades Management, Findify, CoinFession). The user's chosen order supersedes the earlier suggestion to move GitHub below the work.

**Verified:** Temporary in-memory checks using actual components passed all six page titles, history actions, profile actions/expanded state/focus calls, resume availability, shared sound state, hover/focus/tap/keyboard/blur/Escape portrait paths, reduced-motion branches, mobile/desktop hero copy, the restored check badge, and GitHub-before-featured order with all three cards. Note anchor/size rules were checked; exact visual alignment was not inspected. Checks of the actual shared audio controller confirmed no scheduling before opt-in or while muted, and cancellation on mute/stop. TypeScript, full-project ESLint, production build, and diff checks passed. No test files were added.

**Mobile profile menu:** At the user's request, the menu now opens as a wide panel directly below the topbar with a short slide-down animation, 48 px actions, safe-area margins, and internal scrolling on short screens. Reduced-motion mode skips the animation. The production build passed; actual phone appearance remains unverified.

**User confirmation:** After the layout corrections and mobile slide-down menu update, the user confirmed “it's nice and good for now.” Marked done based on that acceptance and the checks above. No automated browser inspection was performed; the confirmation does not establish exhaustive device, keyboard, theme, or YouTube playback coverage.

### 🟢 Done - Project discography

- [x] 🟢 Show owner-confirmed status and separate release availability. Grades Management, Findify, and CoinFession are **Completed ? Awaiting hosting**; PaLista and PowerAtomic are **Completed mobile apps ? Awaiting deployment**; Langgam-it is **In progress**; Video Editing Portfolio is **Released** with the supplied live website link. Completed is distinct from Released.
- [x] 🟢 Use simple square covers with existing artwork. At the owner's request, restore the original coming-soon.jpeg image for Langgam-it, PaLista, and PowerAtomic. Remove repeated titles, category labels, personal marks, colored borders, and tinted backgrounds.
- [x] 🟢 Show one project card grid rather than repeating the same projects in cards and a table. Keep name, subtitle, status, save, and details actions on cards; keep stack, year, and deployment availability in details. Remove the redundant Home table too, while preserving GitHub above Featured projects.
- [x] 🟢 Add labeled native category/status dropdowns, a compact Saved button, a result count, combined filtering, and clear/empty states. Replace the two crowded pill rows after the owner's visual feedback.
- [x] 🟢 Remove invented play counts and fake durations from project data and card/row rendering.
- [x] 🟢 Make hearts save projects to a persistent Saved projects selection. Validate stored IDs and remain usable when storage is corrupt or unavailable.

**Confirmation:** The owner supplied all seven statuses, the live Video Editing Portfolio URL, and the capstone context, then confirmed that PaLista and PowerAtomic are completed and awaiting deployment and requested no screenshots. GitHub contributions remain above the original three Featured projects; no large featured-work spotlight was added.

**Checks before marking implementation done:** TypeScript/production build and ESLint passed. Executable checks against the actual store/component code covered all seven statuses and detail actions, saved-project reload persistence, corrupt/blocked storage, combined filters and empty states, save toggling, case-study sections without screenshots, three distinct illustrated covers, table columns, reader navigation/completion, and preserved Home section order. Hover-panel lifecycle checks and 54 measured placement cases also passed. Git diff whitespace checks passed.

**Design refinement:** The owner found the filters busy, the covers overwhelming, and cards plus tables redundant. Simplified both project grids and removed duplicate tables. Covers now show artwork once without overlaid labels or colored frames; card metadata is reduced. The labeled dropdown toolbar wraps on narrow screens. Production build, ESLint, saved/filter/action checks, and checks for two labeled selects, no duplicate table, and removal of extra card/cover metadata passed. This revised appearance awaits the owner's visual review.

**Image and alignment refinement:** Restored the previous `/coming-soon.jpeg` cover for Langgam-it, PaLista, and PowerAtomic, as requested. Their confirmed statuses remain separate from the artwork. Move flexible card space above the status/save row and keep the details button directly below it, so differing title/subtitle lengths do not shift status rows within equal-height grid cards. Text remains fully visible. Visual alignment still awaits browser/user confirmation.

**Case study deferred:** Removed the Grades Management case study at the owner's request. Its card shows "View details" and its reader contains Overview, Technologies, and Next steps. Future work is tracked in the separate suggestion below.

**Still unverified:** Actual browser appearance, mobile/zoom layouts, and native dialog interaction need visual/browser confirmation because the browser tool reported no available browser. The supplied live URL is wired correctly, but the web tool could not independently fetch it; this does not establish that it is unavailable. This section records completed implementation and the specific automated checks, not deployment or exhaustive visual acceptance.

**User confirmation:** The owner confirmed the current design is good after the image restoration, status alignment changes, and case-study removal. This records user acceptance; exhaustive browser/device checks remain unverified.

### Add later - Project case studies

- [ ] Add an honest Grades Management case study when ready; keep regular project details for now.
- [ ] Use a repeatable structure: problem, intended users, personal role, constraints, decisions, outcome, lessons, and next steps.
- [ ] Add one candid liner note about a difficult decision or improvement.
- [ ] Confirm the final content with the owner before publishing or marking this suggestion done. Do not invent adoption metrics, results, or technical decisions.

**Confirmed context to reuse:** Grades Management was a capstone project. The owner handled full-stack development while still learning development, which was the hardest part. The application is completed and awaiting hosting.

**Scope:** No screenshots, as requested. Optional case-study support remains in the code for later use; no case study is currently exposed to visitors.

### 🟢 Done — About, skills, experience, and contact

- [x] 🟢 Polish the friendly About voice: "complex ideas or problems" and "things are outside my control." Replace the vague scaling claim with personal projects I build, use, and keep improving.
- [x] 🟢 Add a compact "Outside of technology" section using the owner's revised interests: video editing as a passion, cars and motorcycles as hobbies, caffeine, and philosophical topics about life. Keep the confirmed international-client editing work.
- [x] 🟢 Explain AI as an assistant while the owner handles planning, coding, review, testing, and debugging. Use Findify and CoinFession as concrete project context, based on the owner's confirmation.
- [x] 🟢 Keep "Most played" on Skills while replacing numerical ratings with tool descriptions and evidence from project stacks or existing experience tags. Remove percentage-based skill data and unused percentage widgets; the share card also uses the curated core stack.
- [x] 🟢 Link technologies to matching project details. Normalize JavaScript, React Native, and ExpoGo tag spellings. Make React, Django, TypeScript, Node.js, and Tailwind CSS prominent without claiming a measured usage ranking.
- [x] 🟢 Clarify experience contributions: MSU Naawan Document Management System frontend work using Nuxt and Pinia, including UI design and review; full-stack Grades Management capstone work while learning. Distinguish personal projects, internship, education/capstone, and the learning milestone. No measured improvements or adoption results were invented.
- [x] 🟢 Restore the simple Gmail contact card at the owner's request. Remove the Copy email/Open email controls; retain GitHub, Instagram, and TikTok.
- [x] 🟢 End About with Get in touch, Skills/Experience with View projects, and Contact with Explore projects. Case studies remain deferred in their separate add-later suggestion.

**Completion confirmed:** The owner accepted this section as done, including the refined About and Skills layouts and the polished node/tree Experience timeline. Green marks cover the implemented and accepted scope; the additions listed below remain deferred.

**Owner confirmation:** The owner confirmed that AI assists their own planning, coding, review, testing, and debugging, and that video editing for international clients is accurate. They confirmed internship work on a Document Management System using Nuxt and Pinia, with UI review and design. They did not provide a resume file, a current availability/response-time commitment, a professional channel, or measured internship outcomes.

**Checks before marking implementation done:** TypeScript/production build, ESLint, and whitespace checks passed. Executable checks against actual component/data code covered all 19 skill descriptions without numerical ratings, normalized project-stack matches and internship evidence, core-tool ordering and category switching, each related-project action, confirmed About/AI copy, experience types and contributions, contextual page navigation, clipboard success, blocked clipboard selection fallback, and the correct mailto address.

**Review scope:** The owner accepted the design. The browser tool reported no available browser, so exhaustive device/theme checks, native keyboard interaction, and screen-reader announcements remain unverified. Green marks record checked implementation and owner acceptance.

**About and Skills UI refinement:** At the owner's request, replace the plain presentation with a portrait-led About introduction, an AI workflow panel with four steps, and four compact personal-interest cards. Skills now uses real tool icons, restrained record-style artwork, a category header, and a grouped library with numbered tool rows. Preserve project links, confirmed content, and contextual next steps. Mobile layouts stack the portrait and library, wrap the process into two columns, and simplify the interest grid. Shared theme colors keep backgrounds and text consistent in light/dark mode; no additional animation was introduced. At the owner's request, align both pages to the left using the shared page gutter instead of centering their content containers. For widescreens, allow up to 1600 px of content width, keep the About copy at a readable width, and cap skill artwork at 180 px tall. Phone/tablet layouts retain their existing breakpoints.

**Refinement checks:** TypeScript/production build, ESLint, and the existing executable skill-link/category/content/email/navigation checks passed. The browser tool still reported no available browser. The owner accepted the revised appearance; this does not claim verification across every device or theme.

**Tool brand colors:** At the owner's request, use the actual Simple Icons brand colors for all 19 tools, with matching logos in both Most played and the skill library. Replace the decorative per-card palette. Dark logos use light logo surfaces and bright logos use dark surfaces, keeping the surrounding cards theme-aware. Source: https://github.com/simple-icons/simple-icons/blob/develop/data/simple-icons.json. TypeScript/production build and ESLint passed; executable rendering checks covered every tool's mapped icon/color and existing skill project actions. The owner accepted the design; exhaustive browser verification remains pending.

**Rotating record:** Replace the Skills header's outline disc with a vinyl-style record featuring grooves, a reflected sheen, a center label, and a spindle hole. Rotate smoothly once every ten seconds; disable rotation for reduced-motion preferences. Decorative markup is hidden from assistive technology. Production build and ESLint passed; the owner accepted the design; exhaustive browser verification remains pending.

**Experience UI refinement:** Restore the preferred vertical timeline flow, replacing the chapter-card grid with a connected node/tree design. Circular icons sit on a shared vertical path with short branches leading to restrained panels. Dates, roles, and organizations stay visible; role buttons expand contributions and technology tags. Keep the original facts, latest-first order, left alignment, and View projects next step. Compact nodes and spacing on phones; panels expand naturally without clipping descriptions. Follow-up polish adds subtle green node rings, softly shaded panels, connecting-line highlights, rounded chevron controls, and smooth height/opacity transitions. Closed panels are inert and hidden from assistive technology; reduced-motion preferences disable transitions and hover movement.

**About portrait regression fix:** The responsive-image update added intrinsic width/height attributes. About's CSS changed the displayed width but did not override the height attribute, producing the tall cropped strip shown in the owner's screenshot. Set height to auto alongside the existing square aspect ratio so the portrait returns to 240 px square on widescreens, 220/170 px at intermediate widths, and 88 px on phones. Other image wrappers already constrain both dimensions. Production build passed; the corrected rendering awaits browser/user review.

**Experience widescreen follow-up:** Use a container query based on actual available page width (1050 px), accounting for the sidebar. Widen the timeline to 1440 px while keeping it left-aligned, enlarge nodes and role headings, add roomier panel spacing, and place technology tags beside readable contribution text in expanded entries. Align the next-step panel to the timeline width. Narrow layouts retain the existing vertical arrangement. Production build (including TypeScript) and whitespace checks passed; visual review of this follow-up remains pending.

**Experience refinement checks:** Production build (including TypeScript), ESLint, and component interaction checks passed. Checks covered the ordered timeline, all four entries, named native controls with matching panel IDs, initial expansion, opening/closing every entry, one-open-at-a-time behavior, preserved descriptions outside buttons, and the project next step. Follow-up polish also passed build, lint, and interaction checks for matching controls and panels, closed-panel accessibility/interaction exclusion, and single-panel toggling. The owner accepted the polished timeline as done. Exhaustive phone/widescreen and theme verification remains pending.

**Deferred additions ? not part of the completed scope:**

- [ ] Add a resume download when a real, current resume file is available. No file was found. About supports the existing optional resume URL; the profile menu's Request resume action remains available for now.
- [ ] Add a professional channel only after the owner confirms actively using it. No new LinkedIn or other channel was exposed from an unconfirmed profile URL.
- [ ] Add genuine availability, preferred project types, and an expected response window after confirmation. These details were not supplied; remove blanket availability claims from About and Contact for now.

### Visual system, motion, and accessibility

- [x] 🟢 Consolidate repeated control/card/heading styles: shared Button variants, icon buttons, surface cards, tags, section/page headings, and app layout classes. Apply shared spacing, radius, and transition tokens to hero actions, topbar, project/contact cards, share actions, and contact submission.
- [x] 🟢 Preserve the large artist name, strong page/section headings, readable supporting copy, and restrained eyebrow labels. Contact now uses the shared page-heading hierarchy; Featured projects uses the shared section heading.
- [x] 🟢 Keep project artwork and descriptions at full opacity without grayscale or lock overlays. Show availability through status badges. Replace opacity-based disabled buttons with readable muted surfaces and text.
- [x] 🟢 Keep texture on artwork: a very light print-grain layer on skill cover art complements the existing record grooves. Body content and cards retain calm surfaces.
- [x] 🟢 Use short color/background transitions and gentle project-card movement. Remove oversized hero hover scaling, rotating theme-button hover, and contact-card jumps. Respect reduced motion through app-wide Framer Motion configuration, explicit project-card hover gating, existing portrait guards, and a global CSS animation/transition override.
- [x] 🟢 Add global visible keyboard focus, desktop navigation aria-current, stable named theme/sound toggles with aria-pressed, and preserve selected-state semantics for native project selects, saved filters, and skill category buttons.
- [x] 🟢 Done ? Give form fields persistent labels and use a real form with submission handling. Announce pending/errors/success accessibly. Preserve the existing email check and 600-second cooldown behavior.
- [x] 🟢 Add a first-tab Skip to content link. Focus the destination h1 after section navigation without changing the restored scroll position; fall back to the main region when a heading is unavailable. Initial rendering does not steal focus.
- [x] 🟢 Keep explicit project detail actions and keyboard/touch portrait reveal. Add a native date selector for contribution counts so hover is optional. Give shared icon controls a 44 px target (history circles remain visually 32 px), enlarge popover repository/live targets, keep disclosure controls at least 44 px tall, and let contact handles wrap visibly.
- [x] 🟢 Measure 22 text/background pairs from the actual dark/light theme tokens: primary and supporting text plus green accents on three shared surfaces, primary button labels, and tinted tag/copy-confirmation text. All exceed 4.5:1; the lowest measured pair is light-theme green on the secondary surface at 4.82:1.

**Pointer focus refinement:** The owner reported green outlines when clicking ordinary page text/panels. Restrict heading/main outlines to focus-visible, and explicitly suppress them for pointer-only focus. Keep heading focus after navigation, skip-link behavior, and keyboard focus indicators. Production build passed; native browser behavior awaits owner review.

**Checks before marking implementation complete:** Production build (including TypeScript), full-project ESLint, and whitespace checks passed. Temporary executable checks against actual source covered initial/subsequent navigation focus, scroll restoration and recording, skip-link activation, heading fallback, desktop current-page state, shared button semantics, reduced-motion hover behavior, visible project detail actions, desktop/mobile contribution date selection and counts, stable theme/sound labels and pressed states, sound opt-in/mute, audio priming, and profile disclosure state. No live contact messages or paid email-validation requests were made.

**Review limits:** Green checks record verified implementation and measured theme-token contrast. The Browser skill connection reported no available browser, so actual visual appearance, native keyboard/screen-reader behavior, zoom/device layouts, and contrast over rendered images/gradients still need browser/user review. This section has not been marked visually accepted.

## Performance, reliability, and project maintenance

- [x] 🟢 Generate responsive WebP artwork and thumbnails. The current source folder contains seven JPEGs totaling **13,048,703 bytes**, rather than the older eight-image/16.9 MB estimate. The 28 WebP variants total **634,986 bytes** (about 95% smaller in aggregate); the seven largest variants total **342,682 bytes**. Original JPEGs remain available for regeneration. Runtime source sets choose suitable sizes; these disk measurements do not claim a particular download size or load time for every visitor.
- [x] 🟢 Prioritize the hero portrait with eager/high-priority loading. Use lazy responsive images elsewhere, reserve intrinsic image dimensions and square cover space, request the alternate portrait only on reveal, and fall back to vector cover art on image errors.
- [x] 🟢 Verify the existing shared YouTube controller loads only after sound opt-in and a playback request, reuses one player across avatars, stops on mute, and destroys it after the final consumer unmounts. Share preview/export now uses a static portrait with no avatar/audio hook.
- [x] 🟢 Keep html2canvas lazy-loaded on Download. Capture a separate stable, inert 960 px export surface using forExport; wait for fonts and decoded images with a 10-second timeout, relocate the cloned export outside dialog clipping, disable Download while preparing, prevent duplicate requests, and report success/failure. Preserve retryability after errors.
- [x] 🟢 Done — Show useful copy-link failure feedback: a shared error toast tells visitors to copy the website address from the card if clipboard access fails.
- [x] 🟢 Add eight-second GitHub timeout and unmount cancellation, validate calendar dates/counts/levels/total and contiguous date order, cache valid responses in memory/session storage for 30 minutes, handle blocked/corrupt storage, and bypass cache on Retry. Show distinct loading, empty, and failure messages; preserve previous data with a warning if refresh fails.
- [x] 🟢 Replace the simulated Now coding rotation with a manually selected **Project spotlight** for Langgam-it, showing its actual In progress status. Remove the interval/hook; the label does not imply live development activity or an unconfirmed update date.
- [x] 🟢 Add canonical/site Open Graph and large-image social metadata, a locally verified 1200 x 630 preview using the real portrait, a portfolio record favicon, and a 192 px touch icon. Set meaningful browser titles for all six hash-routed pages. Hash routes share the static site-level social preview; crawler/deployment acceptance remains unverified.
- [x] 🟢 Replace the template README with actual setup, commands, content locations, image regeneration, environment keys, contact cooldown/provider limits, data/audio/export behavior, hash routing, and deployment instructions. Explain the Spotify-inspired concept and the need to deploy the email-validation server alongside the frontend.
- [x] 🟢 Confirm zero remaining consumers and remove unused ProjectCard/TrackRow aliases, TeaserRow/ProjectTable, EqualizerBars/useIntersectionObserver, and the simulated useNowCoding hook. TeaserCard plus real ProjectOverview remains the active card/detail behavior; optional case-study support stays for the deferred suggestion.

**Checks before marking implementation complete:** Production build (including TypeScript), ESLint, and whitespace checks passed. Temporary executable checks covered GitHub schema/date/count/level validation, valid and empty results, caching/forced retry, failed HTTP requests, corrupt/blocked storage, cancellation and timeout; distinct GitHub loading/error/empty/stale UI and Retry; responsive mappings and cover error fallback; export asset readiness/timeout/errors/closed surfaces, stable fixed export dimensions, duplicate-click prevention, clone relocation and success/failure feedback; shared audio opt-in, reuse, mute, and cleanup; and all six page titles. Generated WebP headers match every manifest dimension; the preview and touch-icon dimensions were checked, and the social preview was visually inspected. Built output contains the preview and the separate lazy html2canvas chunk. No real contact submissions or paid validation calls were made.

**Review limits:** Runtime image selection, PNG appearance across browsers, actual GitHub service availability, YouTube gesture permissions, social crawler caching, and deployed contact delivery still require browser/deployment review. Original JPEGs are retained in public for regeneration; optimized variants are used by the app, but retaining originals increases deployed asset storage. Green marks describe checked implementation, not a deployed release or exhaustive browser acceptance.

## Implementation priorities — accepted

1. 🟢 **Trust and correctness — Done:** Contact submission/feedback, reactive navigation controls, shared mute behavior, copy-link feedback, and lint are implemented. Project overview controls replace the former simulated playback behavior.
2. 🟢 **Show the work — Done for the agreed scope:** Owner-confirmed statuses and keyboard/touch project details are implemented. The case study remains deferred in its separate add-later suggestion.
3. 🟢 **Mobile and access — Done:** Responsive actions/gutters/safe areas, dialog behavior, keyboard focus, selected states, skip navigation, and reduced-motion support are implemented. Seek/volume sliders were removed with simulated playback.
4. 🟢 **Art direction — Done for the agreed scope:** Consistent cover presentation, refined typography/spacing, artist hero, About/Skills layouts, and the smooth Experience node timeline are accepted. Project-specific case-study liner notes remain deferred.
5. 🟢 **Performance and finish — Done:** Responsive optimized images, deferred shared audio, resilient GitHub data, static share export, social metadata/page titles, documentation, and unused-code cleanup are implemented.

**Owner acceptance:** After reviewing the completed priorities and remaining verification limits, the owner reported that it passed and looks good. The current implementation is accepted. This records the owner's general confirmation; it does not invent a device-by-device testing log or claim a deployment occurred.

## Verification record

- [x] 🟢 Production build, TypeScript, full-project lint, and whitespace checks passed.
- [x] 🟢 Local executable checks covered navigation/focus, component actions, accessibility states, audio opt-in/mute/cleanup, GitHub validation/cache/retry/failures, export readiness/guards/feedback, image mappings/fallbacks/dimensions, and page titles.
- [x] 🟢 Theme-token text contrast and generated social-preview layout were checked.
- [x] 🟢 Owner reported the final pass was good and accepted the current UI, including the corrected About portrait.

**Release-specific verification:** When deploying, confirm intentional contact delivery, production API/environment configuration, social-preview/QR destinations, and provider/browser permissions. An exhaustive device/zoom/screen-reader matrix remains a separate verification activity; no detailed results were supplied. Case studies and their liner notes remain deferred rather than marked completed.
