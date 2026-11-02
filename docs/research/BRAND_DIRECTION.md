# HackerTube AI visual direction

Reading this as an editorial video archive for curious developers and lifelong learners, with the precision of a photographic library and the pace of a cultural journal. This is a redesign of the existing product, retaining its verified catalog, bilingual content and working interactions.

## Audit

The current homepage has a stock full-bleed space banner, a two-row navigation, small metadata, and modal-only video viewing. Public legal pages have a detached narrow template layout. There is no unified detail-page or topic-directory system. Orange letter-mark branding does not communicate the considered, high-signal archive.

## Direction

Design variance 6 / motion 3 / density 6. A cinematic editorial archive: a cool-white page, graphite ink, deep pine green, and restrained warm-gold detail. DM Serif Display is reserved for public editorial headings; Manrope handles navigation, controls and dashboard text; IBM Plex Mono handles counts and small catalog metadata. CJK display falls back to local Songti/Noto Serif when available.

Signature: a wide split feature with an editorial headline and a real cinematic Earth photograph linked to the archived Carl Sagan video. The search sits with the text, so the first interaction is immediately useful. Real video frames stay central. Metadata is outside thumbnail images, and controls are discreet but accessible.

## Palette

Light: background oklch(.985 .003 155), foreground oklch(.235 .018 170), primary pine oklch(.38 .055 170), highlight gold oklch(.80 .07 85), muted oklch(.955 .008 155), border oklch(.89 .012 160).
Dark: background oklch(.19 .012 170), foreground oklch(.94 .012 95), primary sage oklch(.79 .06 158), highlight gold oklch(.80 .07 85), muted oklch(.25 .016 170), border oklch(.34 .018 170).

Media radii 12px, controls 8px, dividers 1px; four columns desktop, two tablet, one phone. Hover zoom 1.035 over 280ms; native FAQ transitions; reduced motion disables transforms. No fake metrics, status dots, decorative serial numbers, glow, or gradient typography.

## Scope

Redesigned homepage and collection/search states. New public video detail, topic directory, and usage-guide pages. Shared public header/footer, legal page shell, branded auth surfaces and global app tokens. Preserve admin appearance settings and all auth/payment/credit business logic. A brand kit includes vector marks, wordmarks, social preview and token/spec documentation.
