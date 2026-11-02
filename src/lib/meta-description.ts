const sentences = new Intl.Segmenter('en', { granularity: 'sentence' });
const terminal = /[.!?。！？]["'”’»）)\]]*$/u;
const abbreviation =
  /(?:\b(?:[A-Z]\.)+|\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc)\.)["'”’)]*$/u;

/** Keep source sentences intact; shorten only when the first sentence cannot fit. */
export function metaDescription(text: string): string {
  const source = text.replace(/\s+/gu, ' ').trim();
  let result = '';
  let pending = '';
  for (const { segment } of sentences.segment(source)) {
    pending += segment;
    if (abbreviation.test(pending.trim())) continue;
    const candidate = (result + pending).trim();
    if (candidate.length > 160) {
      if (result) break;
      // An oversized opening sentence must not hide a later intact source sentence.
      pending = '';
      continue;
    }
    if (terminal.test(candidate)) result = candidate + ' ';
    pending = '';
  }
  if (result) return result.trim();
  if (!source) return '';
  if (source.length <= 160 && terminal.test(source)) return source;

  // Reserve a character for the period, preferring a complete clause.
  const prefix = source.slice(0, 160);
  const clauses = [...prefix.matchAll(/[,;:](?=\s)|\s[—–]\s/gu)];
  const clause = clauses.at(-1);
  const end = clause?.index ?? prefix.search(/\s+\S*$/u);
  const shortened = (
    source.length <= 159 ? source : source.slice(0, Math.max(0, end))
  )
    .trim()
    .replace(/[,;:.!?…—–]+$/u, '');
  return shortened ? `${shortened}.` : '';
}

/** Keep the introduction's subject and first perspective, using a shorter opener. */
export function topicMetaDescription(
  name: string,
  introduction: string
): string {
  const firstTwo = [...sentences.segment(introduction)]
    .slice(0, 2)
    .map(({ segment }) => segment.trim());
  const concise =
    `Explore ${name} videos and talks. ${firstTwo[1] || ''}`.trim();
  return metaDescription(concise.length <= 160 ? concise : firstTwo.join(' '));
}
