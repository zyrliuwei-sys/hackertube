import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { useSavedLearningPaths } from '@/hooks/use-saved-learning-paths';
import { useVideoCollection } from '@/hooks/use-video-collection';

export function HackerTubeAccountLearning() {
  const paths = useSavedLearningPaths();
  const { savedIds } = useVideoCollection();
  return (
    <section aria-labelledby="account-learning" className="space-y-4">
      <h2 id="account-learning" className="text-xl font-semibold">
        {m['hackertube.account.title']()}
      </h2>
      <p className="text-muted-foreground text-sm">
        {m['hackertube.paths.saved_local']()}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/?collection=saved#explore"
          className="hover:bg-muted/40 rounded-xl border p-5"
        >
          <h3 className="font-medium">{m['hackertube.account.saved']()}</h3>
          <p className="mt-2 text-3xl tabular-nums">{savedIds.length}</p>
        </Link>
        <Link
          href="/learning-paths"
          className="hover:bg-muted/40 rounded-xl border p-5"
        >
          <h3 className="font-medium">{m['hackertube.account.paths']()}</h3>
          <p className="text-muted-foreground mt-2 text-sm break-words">
            {paths[0]?.title || m['hackertube.account.empty']()}
          </p>
        </Link>
      </div>
      <Link
        href="/#explore"
        className="inline-block text-sm underline underline-offset-4"
      >
        {m['hackertube.account.browse']()}
      </Link>
    </section>
  );
}
