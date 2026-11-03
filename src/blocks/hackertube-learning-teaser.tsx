import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

export function HackerTubeLearningTeaser() {
  const stages = [
    m['hackertube.paths.sample_math'](),
    m['hackertube.paths.sample_neural'](),
    m['hackertube.paths.sample_build'](),
    m['hackertube.paths.sample_llm'](),
  ];
  return (
    <section className="ht-learning-teaser" aria-labelledby="ht-learning-title">
      <div>
        <p className="ht-eyebrow">{m['hackertube.paths.eyebrow']()}</p>
        <h2 id="ht-learning-title">{m['hackertube.paths.teaser_title']()}</h2>
        <p className="ht-learning-teaser-description">
          {m['hackertube.paths.teaser_description']()}
        </p>
        <Link className="ht-path-teaser-link" href="/learning-paths">
          {m['hackertube.paths.teaser_cta']()}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="ht-learning-preview">
        <p>{m['hackertube.paths.prompt_ml']()}</p>
        <ol>
          {stages.map((title, i) => (
            <li key={title}>
              <span aria-hidden="true">{i + 1}</span>
              <Link href={`/learning-paths#learning-stage-${i + 1}`}>
                {title}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
