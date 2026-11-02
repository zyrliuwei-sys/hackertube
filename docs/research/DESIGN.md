# HackerTube AI first edition

Reading this as a video discovery library for curious developers, with Getty Images' editorial image-led language. Adapt the reference's visual hierarchy to the user-requested product rather than reproduce stock photography commerce.

Reference inspected 2026-11-02: https://www.gettyimages.com/.
Actual computed fonts: Lato, 14px nav/body, 44px reference section headings. White 60px top nav, 53px secondary navigation. Wide search with content-type divider. Full-width image modules, close-packed image galleries, quiet rectangular controls. Orange HN accent replaces unrelated purple commerce branding.

Tokens: white oklch(1 0 0), ink oklch(.20 .002 60), orange oklch(.63 .19 40), pale grey oklch(.97 .001 60), muted oklch(.48 .002 60). Body Lato. Display Space Grotesk. Light default, coherent dark variants. Signature: cinematic Earth image behind generous, left-aligned headline and a wide functional search control.

Design variance 4, motion 3, density 6. No decorative glowing UI, no fake testimonials, no invented video metadata. All content sourced from HackerTube export, attribution kept.

## Page topology

1. Wordmark + secondary navigation; saved count, language switch, guide.
2. Full-bleed cinematic hero + working catalog search and topic selector.
3. Collection provenance strip.
4. Browsable library: area pills, duration filter, sort, grid/list, cards, pagination.
5. Curated collections: broad thematic entry points.
6. Origin / guide callout, footer.
7. Player modal and guide modal.

## Behavior

Reference initial header is not fixed after scrolling. Reference galleries and categories are click-driven; hover reveals navigation submenus. Use click-driven accessible menus, not automatic carousel transitions.
Local product: filters query local imported dataset API; clear and empty states included; search commits on submit, pagination resets when filters change. Saved items stored in localStorage; player loads YouTube nocookie iframe on explicit selection, escape/click outside closes; source fallback opens YouTube. Guide dialog explains origin, filters, playback and privacy. 1440: 4-column, 768: 2-column, 390: 1-column; no horizontal page overflow.
