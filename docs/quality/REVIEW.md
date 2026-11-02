# HackerTube AI — quality review

This is an internal quality review, not an award or a guarantee of selection by an external jury. The user requested iterative work using Awwwards, Webby and FWA as the quality bar.

## Three review passes

1. **Identity and discovery.** Replaced the stock-photo hero with four real archive selections. Added a curiosity atlas to home and `/topics?view=map`, with 16 selectable fields, actual shared-video counts, useful previews and connected-field navigation. All edge counts are tested against the source snapshot. Preserved catalog access, source attribution, SEO copy, existing routes and English-only settings.
2. **Interaction and inclusion.** Increased key controls from 26–34px to 44px; refined small text, keyboard focus, mobile navigation and loading feedback. Added Cmd/Ctrl K and `/` search with debouncing, arrow navigation, Escape and focus restoration. Corrected the mobile auth heading, the two simultaneously selected topic modes, and the watch label's image contrast. The atlas uses a readable selection grid on phones and explains its shared counts.
3. **Performance and recovery.** Reduced the atlas response to displayed fields; replaced public unbounded translation lookups with static whitelists, preserving admin appearance choices. Enabled Nitro gzip/Brotli asset generation. Verified empty search, deliberately blocked API failure and successful retry, keyboard search, light/dark, and responsive layouts.

## Evidence

- `pnpm build`: pass. Scoped TypeScript (application source + catalog tests): pass. Full-repository scratch files were excluded; unrelated D1 changes were preserved.
- `node --import tsx --test tests/video-catalog.test.ts`: 8/8 pass, including exact graph integrity.
- Home measured at 320 / 375 / 414 / 768 / 1440px: no horizontal overflow or escaped content cards; header targets at least 44px. Raw measurements: `responsive.json`.
- axe-core 4.14.0, WCAG A/AA/2.1 AA and best-practice rules: homepage, directory, atlas, guide, watch and privacy have zero violations in the recorded scan. Initial mobile auth heading finding was fixed; sign-in/sign-up rechecks have zero violations. Dark home and command dialog also have zero violations. Automated checks do not replace a screen-reader or human accessibility audit. See `axe-pages.json` and `final-checks.json`.
- Keyboard: selecting atlas fields, search shortcut, Down/Up, Escape, focus return. Search error was induced only in the task-owned browser target; blocking was restored after the test. Empty results and retry recovery passed.

## Performance lab, not field data

Node production build on local port 3020, isolated temporary SQLite QA database; cache disabled. Mobile viewport 375px, 150ms configured latency, 1.6Mbps download and 4x CPU slowdown. PerformanceObserver captured LCP and the maximum CLS session window. These are browser lab samples, not Lighthouse scores or real-user Core Web Vitals.

Before the performance pass: mobile LCP 4,976ms. After: 1,108 / 1,104 / 1,104ms (median 1,104ms); CLS approximately 0.000038. CSS transfer fell from 214,394 to 31,230 bytes with Brotli; primary JS transfer from 416,995 to 112,237 bytes. HTML fell from 134,705 to 112,594 bytes despite the additional visible atlas link. The public entry no longer loads the unbounded translation chunk. Raw profiles and resource sizes: `performance-round-1.json` and `performance-final.json`.

The first request after restarting the Node production server recorded a 4.12s TTFB / 4.22s LCP. The subsequent mobile samples use an initialized server. Cold-start latency remains a deployment-level concern; these favorable warm-server results must not be described as a universal performance guarantee. Cloudflare production, CDN compression, global latency, real-user INP, Safari/Firefox and assistive-technology testing remain unmeasured in this pass. YouTube availability, consent and embeds depend on the upstream platform; no successful external video playback is claimed from a poster/iframe check.

## Design judgement

Internal 1–5 critique: Philosophy 4, Hierarchy 4, Execution 4, Specificity 5, Restraint 4, Variety 4. The functional atlas and real editorial selections give the product a clearer identity. Layout uses the existing visible masthead intentionally; existing spacing/metadata conventions were retained where no usability finding justified changing them. No fake awards, testimonials, metrics, autoplay, scroll hijacking or new decorative animation. This review does not assert that every Hallmark preference is a universal design requirement.

Screenshots: `home-final.png`, `atlas-final.png`, `home-dark.png`, `home-320.png`, `home-768.png`, `watch-mobile.png`, `guide-mobile.png`. Browser extension overlays in screenshots are not part of the site.

## References

[Webby official judging criteria](https://www.webbyawards.com/judging-criteria/) explicitly cover content, navigation, visual design, functionality, interactivity, innovation and overall experience. These informed the review categories. [Awwwards evaluation](https://www.awwwards.com/about-evaluation/) and [FWA about](https://thefwa.com/about) were consulted as references, but their complete scoring text could not be reliably extracted during this session; no unverified scoring weights are used. Compression follows [Nitro's official asset configuration](https://nitro.build/config/assets).

No award submission, production publication, DNS change, commit or database migration was performed. Preview: http://127.0.0.1:3010/.
