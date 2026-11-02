# HackerTube AI brand system

The visual direction is a considered video archive: editorial typography, real video frames, clear source context, a cool reading surface and pine-green controls. It serves curious developers and lifelong learners.

Open the visual board at `/brand/brand-board.html`. Source assets live in `public/brand/`.

## Assets

- `mark.svg`: pine/gold H and play mark, also used as favicon and app logo.
- `mark-monochrome.svg`: single-color mark.
- `wordmark.svg` / `wordmark-reversed.svg`: light-surface and dark-surface wordmarks with embedded Manrope type.
- `social-card.svg`: self-contained 1200×630 sharing artwork with embedded type and existing licensed photograph.
- `social-card.png`: browser-rendered social preview.
- `tokens.json`: light/dark OKLCH tokens, typefaces, radii and motion values.
- `fonts/`: self-hosted Latin brand fonts plus their OFL licenses. CJK uses system fallbacks and existing locale typography.

## Rules

Reserve a quarter of the mark width as clear space. Never stretch, rotate, outline or glow the mark. Prefer 24px or larger for the mark; the simplified favicon remains legible at 16px. Do not use warm gold as body text.

DM Serif Display is for public editorial headings only. Manrope is the interface and dashboard typeface. IBM Plex Mono is reserved for genuine counts and metadata. Use 8px control and 12px media radii, a 1px border, generous spacing around imagery, and one consistent primary control color. Body copy must remain readable on both themes.

Video gallery: four columns desktop, two tablet, one phone. Controls show hover/focus/pressed/disabled/loading states. Native keyboard interactions and reduced motion are retained. Metadata sits outside thumbnails; only video playback and bookmark controls overlay frames. No decorative metrics or fabricated video details.

The root theme remains configurable through existing appearance settings. Manrope is added as a proper font preset; existing saved font selections retain their original meaning. No auth, payment, credits or admin permission logic changes.

## Sources and delivery

The Earth photographs are the existing editorial assets recorded in
`docs/research/FIRST_EDITION.md`. No video creator's work is rebranded as our own.
The catalog remains attributed to HackerTube and open-index under ODC-By.

Implemented pages: homepage, topic directory, video details, guide, privacy/terms,
sign-in and sign-up. Existing dashboards inherit the new semantic tokens and body
font while keeping their configured sidebar/layout behavior.

Local preview for this revision is `http://127.0.0.1:3010/zh`; the earlier port
3001 overlaps with another local project, so this revision uses its own port.
No production deployment or DNS changes were made.

## Verification

Production and Cloudflare builds pass, along with the catalog's 7 tests and
TypeScript checks scoped to application source and catalog tests. The existing
full-repository scratch-file type error described in the first-edition report
was not part of this redesign.

Browser checks covered 1440px desktop, 768px tablet and 390px phone layouts;
English and Chinese; light/dark switching; 16 topic groups/150 category links;
category deep links; click-to-load playback; bookmark changes across pages;
collection reset; mobile navigation; guide and legal layouts; and login inputs.
Unknown video IDs return HTTP 404. No real login or payment transaction was sent.

Calculated sRGB contrast: primary button text 9.44:1 light / 9.79:1 dark; body
15.91:1 / 15.36:1; muted body 6.22:1 / 7.49:1.
