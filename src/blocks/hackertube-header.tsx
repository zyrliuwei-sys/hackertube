import { LogIn } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { saveCatalogIntent } from '@/lib/catalog-intent';
import { m } from '@/paraglide/messages.js';
import { useVideoCollection } from '@/hooks/use-video-collection';
import { HackerTubeSearch } from '@/blocks/hackertube-search';
import { BrandHeader } from '@/components/hackertube/brand-header';
import { SiteUserMenu } from '@/components/site-user-menu';
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
  const { data: session } = useSession();
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
      account={
        session?.user ? (
          <SiteUserMenu
            name={session.user.name || session.user.email}
            email={session.user.email}
            image={session.user.image}
            label={m['hackertube.account.menu']()}
            className="ht-account-button"
          />
        ) : (
          <Link
            href="/sign-in"
            className="ht-sign-in"
            aria-label={m['common.sign.sign_in_title']()}
          >
            <LogIn size={17} aria-hidden="true" />
            <span>{m['common.sign.sign_in_title']()}</span>
          </Link>
        )
      }
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
