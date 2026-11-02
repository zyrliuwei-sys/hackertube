import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { HackerTubeShell } from '@/blocks/hackertube-shell';

const guideKeys = ['discover', 'watch', 'save', 'source'] as const;

export function HackerTubeGuide() {
  return (
    <HackerTubeShell>
      <div className="ht-inner-header ht-guide-header">
        <p className="ht-kicker">{m['hackertube.brand.guide_eyebrow']()}</p>
        <h1>{m['hackertube.brand.guide_title']()}</h1>
        <p>{m['hackertube.brand.guide_description']()}</p>
      </div>
      <div className="ht-guide-cover">
        <img src="/imgs/hackertube/science.jpg" alt="" />
      </div>
      <div className="ht-guide-layout">
        <aside>
          <p>{m['hackertube.brand.guide_contents']()}</p>
          {guideKeys.map((key) => (
            <a href={`#guide-${key}`} key={key}>
              {publicVideoLabel(`hackertube.guide.${key}_title`)}
            </a>
          ))}
        </aside>
        <article>
          {guideKeys.map((key) => (
            <section id={`guide-${key}`} key={key}>
              <h2>{publicVideoLabel(`hackertube.guide.${key}_title`)}</h2>
              <p>{publicVideoLabel(`hackertube.guide.${key}`)}</p>
            </section>
          ))}
          <section className="ht-guide-source">
            <h2>{m['hackertube.brand.guide_source']()}</h2>
            <p>{m['hackertube.guide.independent']()}</p>
            <div className="ht-inline-links">
              <a
                href="https://karpathy.bearblog.dev/hacker-tube/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {m['hackertube.guide.blog']()}
                <ArrowRight size={15} />
              </a>
              <a
                href="https://hackertube.org/about"
                target="_blank"
                rel="noopener noreferrer"
              >
                {m['hackertube.guide.data']()}
                <ArrowRight size={15} />
              </a>
            </div>
          </section>
          <Link className="ht-primary-link" href="/#explore">
            {m['hackertube.brand.guide_start']()}
            <ArrowRight size={17} />
          </Link>
        </article>
      </div>
    </HackerTubeShell>
  );
}
