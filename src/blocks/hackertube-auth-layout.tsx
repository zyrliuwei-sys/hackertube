import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { BrandWordmark } from '@/components/hackertube/brand-header';

export function HackerTubeAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ht-auth-layout">
      <aside className="ht-auth-story">
        <img src="/imgs/hackertube/science.jpg" alt="" />
        <Link
          href="/"
          className="ht-brand-home"
          aria-label={envConfigs.app_name}
        >
          <BrandWordmark name={envConfigs.app_name} />
        </Link>
        <div>
          <h2>{m['hackertube.brand.auth_title']()}</h2>
          <p>{m['hackertube.brand.auth_description']()}</p>
        </div>
        <p>{m['hackertube.brand.auth_note']()}</p>
      </aside>
      <main className="ht-auth-panel">
        <Link className="ht-auth-back" href="/">
          <ArrowLeft size={14} />
          {m['hackertube.brand.auth_back']()}
        </Link>
        <Link
          className="ht-auth-mobile-brand"
          href="/"
          aria-label={envConfigs.app_name}
        >
          <BrandWordmark name={envConfigs.app_name} />
        </Link>
        {children}
      </main>
    </div>
  );
}
