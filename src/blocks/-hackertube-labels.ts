// Static references keep unrelated admin messages out of the public entry.
import { m } from '@/paraglide/messages.js';

const labels: Record<string, () => string> = {
  'hackertube.collections.title': m['hackertube.collections.title'],
  'hackertube.collections.subtitle': m['hackertube.collections.subtitle'],
  'hackertube.collections.code': m['hackertube.collections.code'],
  'hackertube.collections.code_description':
    m['hackertube.collections.code_description'],
  'hackertube.collections.ai': m['hackertube.collections.ai'],
  'hackertube.collections.ai_description':
    m['hackertube.collections.ai_description'],
  'hackertube.collections.science': m['hackertube.collections.science'],
  'hackertube.collections.science_description':
    m['hackertube.collections.science_description'],
  'hackertube.guide.title': m['hackertube.guide.title'],
  'hackertube.guide.intro': m['hackertube.guide.intro'],
  'hackertube.guide.discover_title': m['hackertube.guide.discover_title'],
  'hackertube.guide.discover': m['hackertube.guide.discover'],
  'hackertube.guide.watch_title': m['hackertube.guide.watch_title'],
  'hackertube.guide.watch': m['hackertube.guide.watch'],
  'hackertube.guide.save_title': m['hackertube.guide.save_title'],
  'hackertube.guide.save': m['hackertube.guide.save'],
  'hackertube.guide.source_title': m['hackertube.guide.source_title'],
  'hackertube.guide.source': m['hackertube.guide.source'],
  'hackertube.guide.independent': m['hackertube.guide.independent'],
  'hackertube.guide.blog': m['hackertube.guide.blog'],
  'hackertube.guide.data': m['hackertube.guide.data'],
  'hackertube.area.software': m['hackertube.area.software'],
  'hackertube.area.ai-data': m['hackertube.area.ai-data'],
  'hackertube.area.math-theory': m['hackertube.area.math-theory'],
  'hackertube.area.physics-space': m['hackertube.area.physics-space'],
  'hackertube.area.computing-history-culture':
    m['hackertube.area.computing-history-culture'],
  'hackertube.area.design-graphics-media':
    m['hackertube.area.design-graphics-media'],
  'hackertube.area.business-economics': m['hackertube.area.business-economics'],
  'hackertube.area.arts-entertainment': m['hackertube.area.arts-entertainment'],
  'hackertube.area.systems-security': m['hackertube.area.systems-security'],
  'hackertube.area.hardware': m['hackertube.area.hardware'],
  'hackertube.area.politics-history-society':
    m['hackertube.area.politics-history-society'],
  'hackertube.area.life-sciences-health':
    m['hackertube.area.life-sciences-health'],
  'hackertube.area.earth-energy-environment':
    m['hackertube.area.earth-energy-environment'],
  'hackertube.area.engineering-making': m['hackertube.area.engineering-making'],
  'hackertube.area.games': m['hackertube.area.games'],
  'hackertube.area.ideas-education': m['hackertube.area.ideas-education'],
  'hackertube.type.comedy': m['hackertube.type.comedy'],
  'hackertube.type.commentary': m['hackertube.type.commentary'],
  'hackertube.type.course': m['hackertube.type.course'],
  'hackertube.type.demo': m['hackertube.type.demo'],
  'hackertube.type.documentary': m['hackertube.type.documentary'],
  'hackertube.type.explainer': m['hackertube.type.explainer'],
  'hackertube.type.interview': m['hackertube.type.interview'],
  'hackertube.type.lecture': m['hackertube.type.lecture'],
  'hackertube.type.music': m['hackertube.type.music'],
  'hackertube.type.news': m['hackertube.type.news'],
  'hackertube.type.other': m['hackertube.type.other'],
  'hackertube.type.podcast': m['hackertube.type.podcast'],
  'hackertube.type.talk': m['hackertube.type.talk'],
  'hackertube.type.tutorial': m['hackertube.type.tutorial'],
  'hackertube.atlas.node.software': m['hackertube.atlas.node.software'],
  'hackertube.atlas.node.systems-security':
    m['hackertube.atlas.node.systems-security'],
  'hackertube.atlas.node.hardware': m['hackertube.atlas.node.hardware'],
  'hackertube.atlas.node.computing-history-culture':
    m['hackertube.atlas.node.computing-history-culture'],
  'hackertube.atlas.node.ai-data': m['hackertube.atlas.node.ai-data'],
  'hackertube.atlas.node.math-theory': m['hackertube.atlas.node.math-theory'],
  'hackertube.atlas.node.engineering-making':
    m['hackertube.atlas.node.engineering-making'],
  'hackertube.atlas.node.games': m['hackertube.atlas.node.games'],
  'hackertube.atlas.node.life-sciences-health':
    m['hackertube.atlas.node.life-sciences-health'],
  'hackertube.atlas.node.physics-space':
    m['hackertube.atlas.node.physics-space'],
  'hackertube.atlas.node.earth-energy-environment':
    m['hackertube.atlas.node.earth-energy-environment'],
  'hackertube.atlas.node.design-graphics-media':
    m['hackertube.atlas.node.design-graphics-media'],
  'hackertube.atlas.node.ideas-education':
    m['hackertube.atlas.node.ideas-education'],
  'hackertube.atlas.node.business-economics':
    m['hackertube.atlas.node.business-economics'],
  'hackertube.atlas.node.politics-history-society':
    m['hackertube.atlas.node.politics-history-society'],
  'hackertube.atlas.node.arts-entertainment':
    m['hackertube.atlas.node.arts-entertainment'],
};

export function publicVideoLabel(key: string): string {
  return labels[key]?.() ?? key;
}
