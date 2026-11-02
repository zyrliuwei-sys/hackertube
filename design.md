# HackerTube AI — design lock

An independent, editorial index of videos found in Hacker News. The product should reward curiosity with useful discoveries. It does not claim affiliation with Andrej Karpathy or the original HackerTube.

## Foundations

Retain the established pine / cold white / warm gold palette in `src/styles/globals.css` and `public/brand/tokens.json`. Manrope for interface text, DM Serif Display for editorial headlines, IBM Plex Mono for archive annotations. All new styles consume named tokens. Keep existing light/dark and admin appearance settings.

## Composition

Home: editorial opening, real archive reel, immediately usable catalog, interactive curiosity atlas, collections, long-form discovery guide, source attribution. Topics: searchable directory plus the same atlas. Watch: generous video canvas, title/context, sources and related material. Guide/legal/auth retain their current information architecture.

Existing visible navigation and masthead footer are locked. Add a command search as an accelerator while retaining discoverable links. The atlas is a functional data visualization, not a decorative background: edges count videos classified in both areas. All numbers derive from the local public snapshot. Never describe shared classifications as shared people or recommendation behavior.

## Interaction

44px minimum public control targets. Persistent visible keyboard focus. Dialog focus trapping, Escape, proper loading/empty/error states. Search shortcuts respect text fields. Motion only on opacity/transform, short and interruptible; reduced-motion uses immediate changes. No scroll hijacking, custom cursor, autoplay video, fake testimonials or award claims.

## Verification

Inspect 320, 375, 414, 768 and 1440px, light/dark, keyboard, query/filter, collections and playback. Run axe and production build. Record findings and revisions in `docs/quality/REVIEW.md`. Design critique is internal judgement, never a jury score or guarantee of an award.
