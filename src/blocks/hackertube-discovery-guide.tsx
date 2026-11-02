import { m } from '@/paraglide/messages.js';
import { DiscoveryGuide } from '@/components/hackertube/discovery-guide';

export function HackerTubeDiscoveryGuide({
  onSelect,
}: {
  onSelect: (areaId: string) => void;
}) {
  return (
    <DiscoveryGuide
      title={m['hackertube.discovery.title']()}
      intro={m['hackertube.discovery.intro']()}
      sections={[
        {
          id: 'about',
          title: m['hackertube.discovery.about.title'](),
          body: m['hackertube.discovery.about.body'](),
        },
        {
          id: 'topics',
          title: m['hackertube.discovery.topics.title'](),
          body: m['hackertube.discovery.topics.body'](),
        },
        {
          id: 'search',
          title: m['hackertube.discovery.search.title'](),
          body: m['hackertube.discovery.search.body'](),
        },
        {
          id: 'context',
          title: m['hackertube.discovery.context.title'](),
          body: m['hackertube.discovery.context.body'](),
        },
        {
          id: 'watch',
          title: m['hackertube.discovery.watch.title'](),
          body: m['hackertube.discovery.watch.body'](),
        },
        {
          id: 'learning',
          title: m['hackertube.discovery.learning.title'](),
          body: m['hackertube.discovery.learning.body'](),
        },
      ]}
      topics={[
        {
          id: 'software',
          label: m['hackertube.discovery.topics.programming'](),
        },
        { id: 'ai-data', label: m['hackertube.discovery.topics.ai']() },
        {
          id: 'physics-space',
          label: m['hackertube.discovery.topics.science'](),
        },
      ]}
      faqTitle={m['hackertube.discovery.faq.title']()}
      questions={[
        {
          question: m['hackertube.discovery.faq.original.question'](),
          answer: m['hackertube.discovery.faq.original.answer'](),
        },
        {
          question: m['hackertube.discovery.faq.updates.question'](),
          answer: m['hackertube.discovery.faq.updates.answer'](),
        },
        {
          question: m['hackertube.discovery.faq.tools.question'](),
          answer: m['hackertube.discovery.faq.tools.answer'](),
        },
      ]}
      sourcesLabel={m['hackertube.discovery.sources.label']()}
      sources={[
        {
          href: 'https://hackertube.org/',
          label: m['hackertube.discovery.sources.project'](),
        },
        {
          href: 'https://karpathy.bearblog.dev/hacker-tube/',
          label: m['hackertube.discovery.sources.article'](),
        },
      ]}
      onSelect={onSelect}
    />
  );
}
