import { useEffect, useRef, useState, type FormEvent } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  DiscoveryAtlas,
  Video,
  VideoCatalogResult,
  VideoSort,
} from '@/types/video-catalog';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { apiGet } from '@/lib/api-client';
import { consumeCatalogIntent } from '@/lib/catalog-intent';
import { queueLearningGoal } from '@/lib/learning-path-intent';
import { topicPath } from '@/lib/topic-path';
import { m } from '@/paraglide/messages.js';
import { useVideoCollection } from '@/hooks/use-video-collection';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { Footer } from '@/blocks/footer';
import { HackerTubeAtlas } from '@/blocks/hackertube-atlas';
import { HackerTubeDiscoveryGuide } from '@/blocks/hackertube-discovery-guide';
import { HackerTubeHeader } from '@/blocks/hackertube-header';
import { HackerTubeLearningTeaser } from '@/blocks/hackertube-learning-teaser';
import { ArchiveReel } from '@/components/hackertube/archive-reel';
import { EditorialSections } from '@/components/hackertube/editorial-sections';
import { VideoCard } from '@/components/hackertube/video-card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const topicIds = [
  'software',
  'ai-data',
  'math-theory',
  'physics-space',
  'computing-history-culture',
  'design-graphics-media',
];
const featuredCategories: Record<string, string> = {
  software: 'functional-programming',
  'ai-data': 'llms-generative-ai',
  'math-theory': 'recreational-math',
  'physics-space': 'space-exploration',
  'computing-history-culture': 'history-of-computing',
  'design-graphics-media': 'computer-graphics-rendering',
};
const collectionSpecs = [
  { id: 'software', key: 'code', image: '/imgs/hackertube/computing.jpg' },
  { id: 'ai-data', key: 'ai', image: '/imgs/hackertube/intelligence.jpg' },
  {
    id: 'physics-space',
    key: 'science',
    image: '/imgs/hackertube/science.jpg',
  },
] as const;

export function HackerTube({
  initialCatalog,
  atlas,
  initialFilters = {},
}: {
  initialCatalog: VideoCatalogResult;
  atlas: DiscoveryAtlas;
  initialFilters?: {
    q?: string;
    area?: string;
    category?: string;
    collection?: string;
  };
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialFilters.q || '');
  const [searchMode, setSearchMode] = useState<'videos' | 'learning'>('videos');
  const [query, setQuery] = useState(initialFilters.q || '');
  const [area, setArea] = useState(initialFilters.area || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [type, setType] = useState('');
  const [sort, setSort] = useState<VideoSort>('recommended');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'explore' | 'saved'>(
    initialFilters.collection === 'saved' ? 'saved' : 'explore'
  );
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const { savedIds, toggleSaved: updateSaved } = useVideoCollection();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [video, setVideo] = useState<Video | null>(null);
  useEffect(() => {
    const intent = consumeCatalogIntent();
    if (!intent) return;
    setPage(1);
    setArea('');
    setCategory('');
    if (intent.type === 'saved') {
      setSearchInput('');
      setQuery('');
      setView('saved');
    } else {
      setSearchInput(intent.query);
      setQuery(intent.query);
      setView('explore');
    }
  }, []);
  const libraryRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const params = new URLSearchParams({
    q: query,
    area,
    category,
    type,
    sort,
    page: String(page),
    pageSize: '12',
  });
  if (view === 'saved') params.set('ids', savedIds.join(','));
  const defaultQuery =
    query === (initialFilters.q || '') &&
    area === (initialFilters.area || '') &&
    category === (initialFilters.category || '') &&
    !type &&
    sort === 'recommended' &&
    page === 1 &&
    view === 'explore';
  const catalog = useQuery({
    queryKey: [
      'hackertube-videos',
      query,
      area,
      category,
      type,
      sort,
      page,
      view,
      view === 'saved' ? savedIds.join(',') : '',
    ],
    queryFn: () => apiGet<VideoCatalogResult>(`/api/videos?${params}`),
    initialData: defaultQuery ? initialCatalog : undefined,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const data = catalog.data ?? initialCatalog;
  const items =
    view === 'saved'
      ? data.items.filter((item) => savedIds.includes(item.id))
      : data.items;
  const total =
    view === 'saved'
      ? catalog.data && !catalog.isPlaceholderData
        ? data.total
        : savedIds.length
      : data.total;
  const pages = Math.max(1, Math.ceil(total / 12));
  const selectedArea = data.areas.find((item) => item.id === area);
  const typeLabel = (value: string) =>
    publicVideoLabel(`hackertube.type.${value}`);
  const areaLabel = (id: string) => publicVideoLabel(`hackertube.area.${id}`);
  const goLibrary = () =>
    libraryRef.current?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  const reset = () => {
    setQuery('');
    setSearchInput('');
    setArea('');
    setCategory('');
    setType('');
    setPage(1);
  };
  const selectArea = (id: string) => {
    setArea(id);
    setCategory('');
    setPage(1);
    setView('explore');
    goLibrary();
  };
  const explore = () => {
    setView('explore');
    reset();
    goLibrary();
  };
  const toggleSaved = (id: string) => {
    if (view === 'saved') setPage(1);
    const result = updateSaved(id);
    if (result === 'error') toast.error(m['hackertube.notice.storage']());
    else
      toast.success(
        result === 'saved'
          ? m['hackertube.notice.saved']()
          : m['hackertube.notice.removed']()
      );
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (searchMode === 'learning') {
      const goal = searchInput.trim();
      if (goal.length < 5 || goal.length > 200) return;
      queueLearningGoal(goal);
      router.push(`/learning-paths?goal=${encodeURIComponent(goal)}`);
      return;
    }
    setQuery(searchInput.trim());
    setView('explore');
    setPage(1);
    goLibrary();
  };
  const collections = collectionSpecs.map((item) => ({
    ...item,
    title: publicVideoLabel(`hackertube.collections.${item.key}`),
    description: publicVideoLabel(
      `hackertube.collections.${item.key}_description`
    ),
    countLabel: m['hackertube.library.results']({
      count: (
        data.areas.find((a) => a.id === item.id)?.count ?? 0
      ).toLocaleString('en-US'),
    }),
  }));

  return (
    <div className="ht-site">
      <a className="ht-skip-link" href="#ht-main">
        {m['hackertube.quality.skip']()}
      </a>
      <HackerTubeHeader
        savedCount={savedIds.length}
        onExplore={explore}
        onSaved={() => {
          reset();
          setView('saved');
          goLibrary();
        }}
      />

      <main id="ht-main" tabIndex={-1}>
        <section className="ht-hero" aria-labelledby="ht-headline">
          <div className="ht-hero-content">
            <p className="ht-eyebrow">{m['hackertube.hero.eyebrow']()}</p>
            <h1 id="ht-headline">{m['hackertube.hero.title']()}</h1>
            <p className="ht-hero-description">
              {m['hackertube.hero.description']()}
            </p>
            <div
              className="ht-home-search-mode"
              role="group"
              aria-label={m['hackertube.paths.search_mode']()}
            >
              <button
                type="button"
                aria-pressed={searchMode === 'videos'}
                onClick={() => setSearchMode('videos')}
              >
                {m['hackertube.paths.find_videos']()}
              </button>
              <button
                type="button"
                aria-pressed={searchMode === 'learning'}
                onClick={() => setSearchMode('learning')}
              >
                {m['hackertube.paths.search_mode_learning']()}
              </button>
            </div>
            <form className="ht-search" onSubmit={submitSearch} role="search">
              <Search size={23} aria-hidden="true" />
              <input
                ref={searchRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  searchMode === 'learning'
                    ? m['hackertube.paths.prompt_ml']()
                    : m['hackertube.search.placeholder']()
                }
                aria-label={
                  searchMode === 'learning'
                    ? m['hackertube.paths.goal_label']()
                    : m['hackertube.search.label']()
                }
                required={searchMode === 'learning'}
                minLength={searchMode === 'learning' ? 5 : undefined}
                maxLength={200}
              />
              {searchInput && (
                <button
                  className="ht-clear-search"
                  type="button"
                  aria-label={m['hackertube.search.clear']()}
                  onClick={() => {
                    setSearchInput('');
                    searchRef.current?.focus();
                  }}
                >
                  <X size={16} />
                </button>
              )}
              {searchMode === 'videos' && (
                <div className="ht-search-select">
                  <select
                    aria-label={m['hackertube.search.all']()}
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      setCategory('');
                      setPage(1);
                    }}
                  >
                    <option value="">{m['hackertube.search.all']()}</option>
                    {data.areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {areaLabel(a.id)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              )}
              <button
                type="submit"
                className="ht-search-submit"
                aria-label={
                  searchMode === 'learning'
                    ? m['hackertube.paths.generate']()
                    : m['hackertube.search.button']()
                }
              >
                <span>
                  {searchMode === 'learning'
                    ? m['hackertube.paths.short_generate']()
                    : m['hackertube.search.button']()}
                </span>
                <ArrowRight size={19} />
              </button>
            </form>
            <div className="ht-trending">
              <span>{m['hackertube.search.trending']()}</span>
              {['Bret Victor', 'neural networks', '3Blue1Brown'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchInput(term);
                    setQuery(term);
                    setView('explore');
                    setPage(1);
                    goLibrary();
                  }}
                >
                  {term}
                  <ArrowUpRight size={11} />
                </button>
              ))}
            </div>
            <Link className="ht-hero-atlas-link" href="/topics">
              {m['hackertube.quality.atlas_link']()}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ArchiveReel
            videos={atlas.featured}
            label={m['hackertube.reel.title']()}
            note={m['hackertube.reel.note']()}
          />
        </section>

        <div className="ht-provenance">
          <div>
            <strong>6,454</strong>
            <span>{m['hackertube.stats.videos']()}</span>
          </div>
          <div>
            <strong>150</strong>
            <span>{m['hackertube.stats.topics']()}</span>
          </div>
          <div>
            <strong>2007-2026</strong>
            <span>{m['hackertube.stats.years']()}</span>
          </div>
          <p>
            {m['hackertube.stats.note']()}
            <ArrowUpRight size={18} />
          </p>
        </div>

        <HackerTubeLearningTeaser />

        <section
          ref={libraryRef}
          id="explore"
          className="ht-library"
          aria-labelledby="ht-library-title"
        >
          <div className="ht-library-heading">
            <h2 id="ht-library-title">
              {view === 'saved'
                ? m['hackertube.library.saved_title']()
                : m['hackertube.library.title']()}
            </h2>
            <p>
              {view === 'saved'
                ? m['hackertube.library.saved_subtitle']()
                : m['hackertube.library.subtitle']()}
            </p>
          </div>
          <div className="ht-topic-row">
            <div className="ht-topic-tabs">
              <button
                className={!area ? 'is-active' : ''}
                onClick={() => {
                  setArea('');
                  setCategory('');
                  setPage(1);
                }}
              >
                {m['hackertube.library.all']()}
              </button>
              {topicIds.map((id) => (
                <Link
                  key={id}
                  href={topicPath(id, featuredCategories[id])}
                  className={area === id ? 'is-active' : ''}
                >
                  {
                    data.areas
                      .find((item) => item.id === id)
                      ?.categories.find(
                        (item) => item.id === featuredCategories[id]
                      )?.name
                  }
                </Link>
              ))}
            </div>
            <button
              className={`ht-filter-toggle ${filtersOpen ? 'is-active' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={15} />
              {m['hackertube.library.filters']()}
            </button>
          </div>
          {filtersOpen && (
            <div className="ht-filter-panel">
              <label>
                {m['hackertube.search.all']()}
                <select
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    setCategory('');
                    setPage(1);
                  }}
                >
                  <option value="">{m['hackertube.search.all']()}</option>
                  {data.areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {areaLabel(a.id)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {m['hackertube.library.category']()}
                <select
                  value={category}
                  disabled={!selectedArea}
                  onChange={(e) => {
                    if (e.target.value)
                      router.push(topicPath(area, e.target.value));
                    else {
                      setCategory('');
                      setPage(1);
                    }
                  }}
                >
                  <option value="">{m['hackertube.search.all']()}</option>
                  {selectedArea?.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {m['hackertube.library.all_types']()}
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">
                    {m['hackertube.library.all_types']()}
                  </option>
                  {data.contentTypes.map((t) => (
                    <option key={t} value={t}>
                      {typeLabel(t)}
                    </option>
                  ))}
                </select>
              </label>
              <button className="ht-text-button" onClick={reset}>
                {m['hackertube.library.reset']()}
                <X size={13} />
              </button>
            </div>
          )}
          {selectedArea && (
            <nav
              className="ht-topic-category-links"
              aria-label={m['hackertube.library.category']()}
            >
              {selectedArea.categories.map((item) => (
                <Link key={item.id} href={topicPath(selectedArea.id, item.id)}>
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
          <div className="ht-results-toolbar">
            <div className="ht-results-count" aria-live="polite">
              {total === 1
                ? m['hackertube.library.result_one']()
                : m['hackertube.library.results']({
                    count: total.toLocaleString('en-US'),
                  })}
              {query && (
                <button
                  className="ht-query-tag"
                  onClick={() => {
                    setQuery('');
                    setSearchInput('');
                    setPage(1);
                  }}
                >
                  {query}
                  <X size={12} />
                </button>
              )}
              {area && !topicIds.includes(area) && (
                <span className="ht-query-tag">{areaLabel(area)}</span>
              )}
            </div>
            <div className="ht-view-controls">
              <div className="ht-sort">
                <select
                  aria-label={m['hackertube.library.sort']()}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as VideoSort);
                    setPage(1);
                  }}
                >
                  <option value="recommended">
                    {m['hackertube.library.recommended']()}
                  </option>
                  <option value="popular">
                    {m['hackertube.library.popular']()}
                  </option>
                  <option value="newest">
                    {m['hackertube.library.newest']()}
                  </option>
                </select>
                <ChevronDown size={13} />
              </div>
              <div className="ht-layout-toggle">
                <button
                  className={layout === 'grid' ? 'is-active' : ''}
                  aria-label={m['hackertube.library.grid']()}
                  aria-pressed={layout === 'grid'}
                  onClick={() => setLayout('grid')}
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  className={layout === 'list' ? 'is-active' : ''}
                  aria-label={m['hackertube.library.list']()}
                  aria-pressed={layout === 'list'}
                  onClick={() => setLayout('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
          {catalog.isFetching && (
            <p className="ht-catalog-status" role="status">
              {m['hackertube.library.loading']()}
            </p>
          )}
          {catalog.isError ? (
            <div className="ht-empty" role="alert">
              <Search size={32} />
              <h3>{m['hackertube.library.error']()}</h3>
              <button onClick={() => catalog.refetch()}>
                {m['hackertube.library.retry']()}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : !items.length && !catalog.isFetching ? (
            <div className="ht-empty">
              <Bookmark size={32} />
              <h3>
                {view === 'saved'
                  ? m['hackertube.library.saved_empty']()
                  : m['hackertube.library.empty']()}
              </h3>
              <p>
                {view === 'saved'
                  ? m['hackertube.library.saved_empty_text']()
                  : m['hackertube.library.empty_text']()}
              </p>
              <button onClick={explore}>
                {m['hackertube.library.explore']()}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`ht-video-grid ${layout === 'list' ? 'is-list' : ''} ${catalog.isFetching ? 'is-loading' : ''}`}
              aria-busy={catalog.isFetching}
            >
              {items.map((item) => (
                <VideoCard
                  key={item.id}
                  video={item}
                  saved={savedIds.includes(item.id)}
                  playLabel={m['hackertube.card.play']({ title: item.title })}
                  saveLabel={
                    savedIds.includes(item.id)
                      ? m['hackertube.card.saved']()
                      : m['hackertube.card.save']()
                  }
                  recommendationLabel={
                    item.recommendations > 0
                      ? m['hackertube.card.recommendations']({
                          count: item.recommendations,
                        })
                      : m['hackertube.card.mentions']({ count: item.mentions })
                  }
                  typeLabel={typeLabel(item.contentType)}
                  imageUnavailableLabel={m[
                    'hackertube.card.image_unavailable'
                  ]()}
                  onPlay={() => setVideo(item)}
                  onSave={() => toggleSaved(item.id)}
                />
              ))}
            </div>
          )}
          {total > 0 && !catalog.isError && (
            <div className="ht-pagination">
              <p>
                {m['hackertube.library.showing']({
                  start: (page - 1) * 12 + 1,
                  end: Math.min(page * 12, total),
                  total,
                })}
              </p>
              <div>
                <button
                  disabled={page <= 1 || catalog.isFetching}
                  aria-label={m['hackertube.library.previous']()}
                  onClick={() => {
                    setPage(page - 1);
                    goLibrary();
                  }}
                >
                  <ChevronLeft size={17} />
                </button>
                <span>{m['hackertube.library.page']({ page, pages })}</span>
                <button
                  disabled={page >= pages || catalog.isFetching}
                  aria-label={m['hackertube.library.next']()}
                  onClick={() => {
                    setPage(page + 1);
                    goLibrary();
                  }}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>
        <HackerTubeAtlas data={atlas} />
        <EditorialSections
          collections={collections}
          heading={m['hackertube.collections.title']()}
          subheading={m['hackertube.collections.subtitle']()}
          onSelect={selectArea}
          origin={{
            eyebrow: m['hackertube.origin.eyebrow'](),
            title: m['hackertube.origin.title'](),
            description: m['hackertube.origin.description'](),
            guideLabel: m['hackertube.origin.guide'](),
            originalLabel: m['hackertube.origin.original'](),
            originalUrl: 'https://hackertube.org/',
          }}
          onGuide={() => setGuideOpen(true)}
        >
          <HackerTubeDiscoveryGuide onSelect={selectArea} />
        </EditorialSections>
      </main>
      <Footer />

      <Dialog
        open={!!video}
        onOpenChange={(open) => {
          if (!open) setVideo(null);
        }}
      >
        <DialogContent className="ht-player-dialog" showCloseButton={false}>
          {video && (
            <>
              <div className="ht-dialog-top">
                <span>{envConfigs.app_name}</span>
                <DialogClose
                  className="ht-dialog-close"
                  aria-label={m['hackertube.nav.close']()}
                >
                  <X size={22} />
                </DialogClose>
              </div>
              <div className="ht-player-embed">
                <iframe
                  key={video.id}
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <div className="ht-player-body">
                <DialogTitle className="ht-player-title">
                  {video.title}
                </DialogTitle>
                <DialogDescription className="ht-player-description">
                  {video.channel}
                </DialogDescription>
                <p>{video.summary}</p>
                {video.whyRecommended && (
                  <div className="ht-player-why">
                    <h3>{m['hackertube.player.why']()}</h3>
                    <p>{video.whyRecommended}</p>
                  </div>
                )}
                <div className="ht-player-links">
                  <Link
                    href={`/watch/${video.id}`}
                    onClick={() => setVideo(null)}
                  >
                    {m['hackertube.brand.open_page']()}
                    <ArrowUpRight size={15} />
                  </Link>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {m['hackertube.player.youtube']()}
                    <ArrowUpRight size={15} />
                  </a>
                  {video.hnUrl && (
                    <a
                      href={video.hnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m['hackertube.player.hn']()}
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                  <button onClick={() => toggleSaved(video.id)}>
                    {savedIds.includes(video.id) ? (
                      <Check size={15} />
                    ) : (
                      <Bookmark size={15} />
                    )}
                    {savedIds.includes(video.id)
                      ? m['hackertube.card.saved']()
                      : m['hackertube.card.save']()}
                  </button>
                </div>
                <p className="ht-playback-note">
                  {m['hackertube.player.note']()}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="ht-guide-dialog" showCloseButton={false}>
          <div className="ht-dialog-top">
            <span>{envConfigs.app_name}</span>
            <DialogClose
              className="ht-dialog-close"
              aria-label={m['hackertube.nav.close']()}
            >
              <X size={22} />
            </DialogClose>
          </div>
          <DialogTitle className="ht-guide-title">
            {m['hackertube.guide.title']()}
          </DialogTitle>
          <DialogDescription>{m['hackertube.guide.intro']()}</DialogDescription>
          <div className="ht-guide-steps">
            {['discover', 'watch', 'save', 'source'].map((key) => (
              <section key={key}>
                <h3>{publicVideoLabel(`hackertube.guide.${key}_title`)}</h3>
                <p>{publicVideoLabel(`hackertube.guide.${key}`)}</p>
              </section>
            ))}
          </div>
          <p className="ht-independent-note">
            {m['hackertube.guide.independent']()}
          </p>
          <div className="ht-player-links">
            <a
              href="https://karpathy.bearblog.dev/hacker-tube/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m['hackertube.guide.blog']()}
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://hackertube.org/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m['hackertube.guide.data']()}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
