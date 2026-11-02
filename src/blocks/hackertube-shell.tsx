import type { ReactNode } from 'react';

import { m } from '@/paraglide/messages.js';
import { Footer } from '@/blocks/footer';
import { HackerTubeHeader } from '@/blocks/hackertube-header';

export function HackerTubeShell({ children }: { children: ReactNode }) {
  return (
    <div className="ht-site ht-inner-site">
      <a className="ht-skip-link" href="#ht-main">
        {m['hackertube.quality.skip']()}
      </a>
      <HackerTubeHeader />
      <main id="ht-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
