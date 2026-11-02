import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { HackerTubeShell } from '@/blocks/hackertube-shell';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <HackerTubeShell>
      <div className="ht-legal-shell">
        <div className="ht-breadcrumb">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            {m['common.pages.back_to_home']()}
          </Link>
        </div>
        <div className="ht-legal-content">
          <MDXProvider components={mdxComponents}>
            <Outlet />
          </MDXProvider>
        </div>
      </div>
    </HackerTubeShell>
  );
}
