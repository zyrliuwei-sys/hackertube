import { usePathname, useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { saveCatalogIntent } from '@/lib/catalog-intent';
import { m } from '@/paraglide/messages.js';
import { useVideoCollection } from '@/hooks/use-video-collection';
import { HackerTubeSearch } from '@/blocks/hackertube-search';
import { BrandHeader } from '@/components/hackertube/brand-header';
import { ThemeToggle } from '@/components/theme-toggle';

export function HackerTubeHeader({
  savedCount,
  onSaved,
  onExplore,
}: {
  savedCount?: number;
  onSaved?: () => void;
  onExplore?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { savedIds } = useVideoCollection();
  return (
    <BrandHeader
      name={envConfigs.app_name}
      links={[
        {
          href: '/#explore',
          label: m['hackertube.nav.explore'](),
          active: pathname === '/',
          onClick: onExplore,
        },
        {
          href: '/topics',
          label: m['hackertube.nav.topics'](),
          active: pathname === '/topics',
        },
        {
          href: '/learning-paths',
          label: m['hackertube.paths.nav'](),
          active: pathname === '/learning-paths',
        },
        {
          href: '/guide',
          label: m['hackertube.nav.guide'](),
          active: pathname === '/guide',
        },
      ]}
      savedLabel={m['hackertube.nav.saved']()}
      savedCount={savedCount ?? savedIds.length}
      menuLabel={m['hackertube.nav.menu']()}
      closeLabel={m['hackertube.nav.close']()}
      onSaved={
        onSaved ??
        (() => {
          saveCatalogIntent({ type: 'saved' });
          router.push('/#explore');
        })
      }
      tools={
        <>
          <HackerTubeSearch />
          <ThemeToggle />
        </>
      }
    />
  );
}
