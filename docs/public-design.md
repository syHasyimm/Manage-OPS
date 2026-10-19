# Public SPMB design

Redesign of the homepage and public status page for parents registering elementary-school pupils. Keep the existing school identity, URL structure, navigation labels, registration rules, and chatbot.

The public interface uses the Ceria & Hangat palette: primary blue `#3B82F6`, secondary amber `#FBBF24`, accent green `#22C55E`, danger red `#EF4444`, ivory background `#FEFCF8`, and slate text `#1E293B`. Keep the requested light palette consistent across system color preferences. The family photograph is retained.

Headings use Plus Jakarta Sans; body text and controls use Manrope. Both are locally hosted variable WOFF2 fonts (weights 400–800), with Latin and extended Latin coverage and their OFL licenses in `public/fonts`. Preload the two Latin files. Use darker shades for small text where necessary for contrast, including green status labels and red validation messages.

Public pages, authentication, the applicant dashboard, registration forms, and the chatbot share this palette. The admin dashboard and setup screen use white/slate surfaces with blue navigation, controls, and charts. The `.spmb-admin-page` scope maps shared secondary/success tokens to blue and slate; destructive controls and validation retain red as a functional cue.

- DESIGN_VARIANCE: 4. An offset photo and clearly grouped service information, with single-column mobile layouts.
- MOTION_INTENSITY: 4. Staggered hero content, one-time scroll reveals, short page transitions, menu/dialog entrance and exit, and hover/press feedback. No continuous decorative motion or scroll hijacking. Respect reduced motion across public and admin screens.
- VISUAL_DENSITY: 4. Registration actions, dates, and help remain easy to scan.
- Foundation: existing React, Tailwind 3, Radix dialog, Motion, and Lucide. No additional frontend dependencies.
- Shape scale: 12px controls, 24px information panels, 32px hero photograph.
- Layers: sticky header 40, chatbot 50, mobile navigation dialog 60.

Period details sit outside the photograph. The registration journey uses an ordered list; requirements use an age panel and a document grid. Mobile navigation uses an accessible dialog with Escape handling and focus restoration.

Font files are served locally with their OFL licenses. The admin layout loads only for admin routes, and Markdown rendering loads when chat is opened. These keep unnecessary code and external font requests out of the initial public-page load.

Motion is shared through `Components/Motion.jsx` and `css/motion.css`, using the existing `motion/react` dependency. Page transitions are keyed by component and pathname, so query filters, validation, and polling preserve form state. Dashboard content uses opacity-only page transitions to preserve viewport positioning for fixed dialogs; individual cards reveal on first entry into view. Hover effects use individual CSS transforms so responsive menu centering stays intact. `MotionConfig`, `useReducedMotion`, CSS media rules, and chart settings respect reduced motion. Entrance durations are 360–550ms; interaction and exit durations are 160–280ms.

Verify open/future/closed/no-period states, guest/user/admin actions, mobile navigation, status form validation/results, chatbot, keyboard focus, reduced motion, and overflow at 320px and wider. Run the frontend build, existing PHP tests, and browser checks.
