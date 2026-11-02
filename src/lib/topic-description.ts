import type { Video, VideoArea, VideoCategory } from '@/types/video-catalog';

const perspectives: Record<string, string> = {
  software:
    'Read software through the choices behind its abstractions, implementations, and everyday practice.',
  'systems-security':
    'Follow the boundaries between infrastructure, reliability, trust, and the people operating a system.',
  'ai-data':
    'Look at the relationship between models, data, demonstrations, and claims about intelligent behavior.',
  'math-theory':
    'Approach the subject through definitions, worked reasoning, and the connections that make an abstract idea useful.',
  hardware:
    'Consider the physical implementation behind a device, alongside the constraints that shape its design.',
  'computing-history-culture':
    'Treat computing as a history of people and institutions as well as machines and software.',
  'design-graphics-media':
    'Look for the decisions connecting visual results, creative tools, and the experience of an audience.',
  'business-economics':
    'Compare explanations of incentives, organizational choices, and the consequences of economic decisions.',
  'politics-history-society':
    'Pay attention to historical context, institutional power, and the perspective from which an argument is presented.',
  'physics-space':
    'Move between physical explanations and the observations, experiments, or engineering questions that motivate them.',
  'life-sciences-health':
    'Distinguish accounts of biological mechanisms from interpretations of behavior and claims about human health.',
  'earth-energy-environment':
    'Consider the connections between natural processes, engineered systems, resources, and public choices.',
  'engineering-making':
    'Look at how a practical problem becomes a design, a process, or a working physical object.',
  games:
    'Explore games as designed experiences, software systems, and artifacts with their own histories and communities.',
  'arts-entertainment':
    'Watch for the relationship between a finished performance, its craft, and the cultural context around it.',
  'ideas-education':
    'Compare ways of explaining, questioning, and communicating ideas across different subjects and traditions.',
};

const clean = (value: string) => value.replace(/\s+/gu, ' ').trim();
const words = (value: string) => clean(value).split(/\s+/u).filter(Boolean);
const excerpt = (value: string, limit: number) => {
  const parts = words(value);
  return parts.length > limit
    ? `${parts.slice(0, limit).join(' ')}…`
    : clean(value);
};
const list = (items: string[]) =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/** Describe the full category inventory, rather than the current results page.
 * Examples maximize new topic coverage and favor different channels. All factual
 * details come from the supplied records; no catalog or server imports are needed.
 */
export function describeTopic(
  area: VideoArea,
  category: VideoCategory,
  videos: Video[]
): string[] {
  const inventory = [
    ...new Map(
      videos
        .filter(
          (video) =>
            video.areaIds.includes(area.id) &&
            video.categoryIds.includes(category.id)
        )
        .map((video) => [video.id, video] as const)
    ).values(),
  ].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, 'en'));
  const frequencies = new Map<string, { label: string; count: number }>();
  for (const video of inventory) {
    for (const topic of new Set(video.topics.map(clean).filter(Boolean))) {
      const key = topic.toLowerCase();
      const previous = frequencies.get(key);
      frequencies.set(key, {
        label: previous?.label ?? topic,
        count: (previous?.count ?? 0) + 1,
      });
    }
  }
  const topics = [...frequencies.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'en'))
    .slice(0, 6)
    .map(({ label }) => excerpt(label, 5));
  const formats = [
    ...new Set(
      inventory.map((video) => clean(video.contentType)).filter(Boolean)
    ),
  ].sort();
  const channels = new Set(
    inventory.map((video) => clean(video.channel)).filter(Boolean)
  );
  const selected: Video[] = [];
  const covered = new Set<string>();
  const usedChannels = new Set<string>();
  const remaining = [...inventory];
  while (selected.length < 4 && remaining.length) {
    let best = 0;
    let bestValue = -1;
    remaining.forEach((video, index) => {
      const novelty = video.topics.filter(
        (topic) => !covered.has(topic.toLowerCase())
      ).length;
      const value = novelty + (usedChannels.has(video.channel) ? 0 : 3);
      if (value > bestValue) {
        best = index;
        bestValue = value;
      }
    });
    const video = remaining.splice(best, 1)[0]!;
    selected.push(video);
    video.topics.forEach((topic) => covered.add(topic.toLowerCase()));
    usedChannels.add(video.channel);
  }
  const paragraphs = [
    `${category.name} sits within ${area.name}. ${perspectives[area.id] ?? 'Compare the questions, examples, and perspectives represented in this collection.'} This selection contains ${inventory.length} catalog videos from ${channels.size} distinct channels. The examples below offer specific entry points into the subject, with their own vocabulary and scope, rather than a prescribed sequence of lessons.`,
    topics.length
      ? `Recurring catalog topics include ${list(topics)}. These tags describe overlapping directions within the collection; an individual video may connect several of them. Recorded formats include ${list(formats.map((format) => excerpt(format, 3)))}. Use those differences to choose between approaches to the subject and to compare how different contributors frame related questions.`
      : 'There are no topic tags in the supplied selection. The category label provides a starting point, while individual titles and descriptions provide the more specific context for choosing what to watch.',
  ];
  for (const video of selected) {
    const description = `“${excerpt(video.title, 16)}”${clean(video.channel) ? `, listed under ${excerpt(video.channel, 7)},` : ''} is cataloged as ${clean(video.contentType) || 'a video'}. ${excerpt(video.summary || video.topics.join(', '), 32)}`;
    if (words([...paragraphs, description].join(' ')).length <= 240)
      paragraphs.push(description);
    if (words(paragraphs.join(' ')).length >= 175) break;
  }
  const guidance = [
    'For a closer comparison, follow a topic from one title to another and read each summary before choosing a starting point.',
    'The channel and format labels offer additional context about how the material is presented. A shared category does not imply that contributors share an argument or reach the same conclusions.',
    'These descriptions reflect the supplied catalog snapshot. Use the individual video records to explore the examples in more detail and decide which questions you want to pursue next.',
  ];
  for (const sentence of guidance) {
    if (words(paragraphs.join(' ')).length >= 150) break;
    paragraphs.push(sentence);
  }
  return paragraphs;
}
