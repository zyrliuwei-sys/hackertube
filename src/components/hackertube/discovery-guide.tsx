import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';

interface DiscoveryGuideProps {
  title: string;
  intro: string;
  sections: { id: string; title: string; body: string }[];
  topics: { id: string; label: string }[];
  faqTitle: string;
  questions: { question: string; answer: string }[];
  sourcesLabel: string;
  sources: { href: string; label: string }[];
  onSelect: (areaId: string) => void;
}

export function DiscoveryGuide({
  title,
  intro,
  sections,
  topics,
  faqTitle,
  questions,
  sourcesLabel,
  sources,
  onSelect,
}: DiscoveryGuideProps) {
  return (
    <section className="ht-discovery" aria-labelledby="ht-discovery-title">
      <div className="ht-discovery-intro">
        <h2 id="ht-discovery-title">{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="ht-discovery-sections">
        {sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={`ht-discovery-${section.id}`}
          >
            <h3 id={`ht-discovery-${section.id}`}>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <nav className="ht-discovery-topics" aria-label={title}>
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic.id)}
          >
            {topic.label}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        ))}
      </nav>
      <section
        className="ht-discovery-faq"
        aria-labelledby="ht-discovery-faq-title"
      >
        <h3 id="ht-discovery-faq-title">{faqTitle}</h3>
        {questions.map((item) => (
          <details key={item.question}>
            <summary>
              <span>{item.question}</span>
              <Plus size={17} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
      <div className="ht-discovery-sources">
        <span>{sourcesLabel}</span>
        {sources.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.label}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
