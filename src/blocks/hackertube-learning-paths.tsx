import { useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import type {
  LearningLevel,
  LearningPath,
  LearningPathInput,
} from '@/types/learning-path';
import {
  ArrowRight,
  ArrowUpRight,
  LoaderCircle,
  Route as RouteIcon,
} from 'lucide-react';

import { Link, useRouter } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import { learningPathInput } from '@/lib/learning-path-input';
import { takeLearningGoal } from '@/lib/learning-path-intent';
import {
  clearSavedLearningPaths,
  readSavedLearningPaths,
  saveLearningPath,
} from '@/lib/learning-path-storage';
import { m } from '@/paraglide/messages.js';
import { useSavedLearningPaths } from '@/hooks/use-saved-learning-paths';
import { HackerTubeShell } from '@/blocks/hackertube-shell';
import { TextField } from '@/components/form-field';
import { LearningPathView } from '@/components/hackertube/learning-path-view';

export function HackerTubeLearningPaths({
  example,
  initialGoal = '',
}: {
  example: LearningPath;
  initialGoal?: string;
}) {
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(
    initialGoal ? null : example
  );
  const resultRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);
  const restored = useRef(false);
  const savedPaths = useSavedLearningPaths();
  const [storageError, setStorageError] = useState(false);
  const mutation = useMutation({
    mutationFn: (input: LearningPathInput) =>
      apiPost<LearningPath>('/api/learning-paths', input),
    onSuccess: (result) => {
      setPath(result);
      if (result.stages.length) {
        const saved = saveLearningPath(result);
        setStorageError(!saved);
        // Keep the URL's restore target in sync when the submitted goal changes.
        // Only navigate after persistence succeeds: otherwise remounting would
        // discard the result when browser storage is unavailable.
        if (saved && initialGoal !== result.goal)
          router.replace(
            `/learning-paths?goal=${encodeURIComponent(result.goal)}`
          );
      }
    },
  });
  const form = useForm({
    defaultValues: {
      goal: initialGoal || example.goal,
      level: 'beginner' as LearningLevel,
    },
    validators: { onSubmit: learningPathInput },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch {
        /* The inline error preserves the goal for retry. */
      }
    },
  });
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      const saved = readSavedLearningPaths().find(
        (p) => !initialGoal || p.goal === initialGoal
      );
      if (saved) {
        setPath(saved);
        form.setFieldValue('goal', saved.goal);
        form.setFieldValue('level', saved.level);
      }
    }
    if (initialGoal && !autoStarted.current && takeLearningGoal(initialGoal)) {
      autoStarted.current = true;
      const input = learningPathInput.safeParse({
        goal: initialGoal,
        level: 'beginner',
      });
      if (input.success) mutation.mutate(input.data);
    }
  }, [initialGoal]);
  useEffect(() => {
    if (mutation.isSuccess) {
      resultRef.current?.querySelector<HTMLElement>('h2')?.focus();
    }
  }, [path, mutation.isSuccess]);
  const suggestions = [
    m['hackertube.paths.prompt_ml'](),
    m['hackertube.paths.prompt_systems'](),
    m['hackertube.paths.prompt_web'](),
  ];
  return (
    <HackerTubeShell>
      <section className="ht-path-page">
        <header className="ht-path-page-heading">
          <p className="ht-eyebrow">{m['hackertube.paths.eyebrow']()}</p>
          <h1>{m['hackertube.paths.title']()}</h1>
          <p>{m['hackertube.paths.description']()}</p>
        </header>
        <div className="ht-path-layout">
          <aside
            className="ht-path-planner"
            aria-label={m['hackertube.paths.form_title']()}
          >
            <RouteIcon size={27} strokeWidth={1.4} aria-hidden="true" />
            <h2>{m['hackertube.paths.form_title']()}</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <form.Field name="goal">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['hackertube.paths.goal_label']()}
                    placeholder={m['hackertube.paths.prompt_ml']()}
                    multiline
                    required
                    disabled={mutation.isPending}
                  />
                )}
              </form.Field>
              <form.Field name="level">
                {(field) => (
                  <div className="ht-path-level">
                    <label htmlFor="learning-level">
                      {m['hackertube.paths.level_label']()}
                    </label>
                    <select
                      id="learning-level"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value as LearningLevel)
                      }
                      disabled={mutation.isPending}
                    >
                      <option value="beginner">
                        {m['hackertube.paths.beginner']()}
                      </option>
                      <option value="intermediate">
                        {m['hackertube.paths.intermediate']()}
                      </option>
                    </select>
                  </div>
                )}
              </form.Field>
              <button
                className="ht-path-generate"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <LoaderCircle
                    className="ht-search-spinner"
                    size={18}
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRight size={18} aria-hidden="true" />
                )}
                {mutation.isPending
                  ? m['hackertube.paths.generating']()
                  : m['hackertube.paths.generate']()}
              </button>
              {mutation.isError && (
                <p className="ht-path-error" role="alert">
                  {mutation.error.message}
                </p>
              )}
            </form>
            <div className="ht-path-prompts">
              <p>{m['hackertube.paths.try']()}</p>
              {suggestions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => {
                    form.setFieldValue('goal', goal);
                    mutation.reset();
                  }}
                >
                  {goal}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="ht-path-planner-note">
              {m['hackertube.paths.method']()}
            </p>
            {storageError && (
              <p role="alert" className="ht-path-error">
                {m['hackertube.paths.storage_error']()}
              </p>
            )}
            {savedPaths.length > 0 && (
              <div className="ht-path-prompts">
                <h2>{m['hackertube.paths.recent']()}</h2>
                <p>{m['hackertube.paths.saved_local']()}</p>
                {savedPaths.map((saved) => (
                  <button
                    key={`${saved.goal}:${saved.level}`}
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => {
                      setPath(saved);
                      form.setFieldValue('goal', saved.goal);
                      form.setFieldValue('level', saved.level);
                      mutation.reset();
                      const persisted = saveLearningPath(saved);
                      setStorageError(!persisted);
                      if (persisted && initialGoal !== saved.goal)
                        router.replace(
                          `/learning-paths?goal=${encodeURIComponent(saved.goal)}`
                        );
                    }}
                  >
                    {saved.title}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => setStorageError(!clearSavedLearningPaths())}
                >
                  {m['hackertube.paths.clear_saved']()}
                </button>
              </div>
            )}
          </aside>
          <div
            className="ht-path-output"
            ref={resultRef}
            aria-busy={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className="ht-path-loading" role="status">
                <LoaderCircle
                  size={30}
                  className="ht-search-spinner"
                  aria-hidden="true"
                />
                <h2>{m['hackertube.paths.loading_title']()}</h2>
                <p>{m['hackertube.paths.loading_text']()}</p>
              </div>
            ) : path ? (
              <LearningPathView
                key={path.goal + path.title}
                path={path}
                labels={{
                  example: m['hackertube.paths.example'](),
                  ai: m['hackertube.paths.ai'](),
                  catalog: m['hackertube.paths.catalog'](),
                  fallback: m['hackertube.paths.fallback'](),
                  stages: m['hackertube.paths.stages'](),
                  videos: m['hackertube.paths.videos'](),
                  why: m['hackertube.paths.why'](),
                  context: m['hackertube.paths.context'](),
                  discussion: m['hackertube.paths.discussion'](),
                  practice: m['hackertube.paths.practice'](),
                  complete: m['hackertube.paths.complete'](),
                  completed: m['hackertube.paths.completed'](),
                  progress: m['hackertube.paths.progress'](),
                  local: m['hackertube.paths.local'](),
                  download: m['hackertube.paths.download'](),
                  source: m['hackertube.paths.source'](),
                  emptyTitle: m['hackertube.paths.empty_title'](),
                  emptyText: m['hackertube.paths.empty_text'](),
                  browse: m['hackertube.paths.browse'](),
                  recommenders: m['hackertube.paths.recommenders'](),
                }}
              />
            ) : (
              <div className="ht-path-empty">
                <RouteIcon size={36} strokeWidth={1.2} aria-hidden="true" />
                <h2>{m['hackertube.paths.ready_title']()}</h2>
                <p>{m['hackertube.paths.ready_text']()}</p>
              </div>
            )}
          </div>
        </div>
        <section className="ht-path-about">
          <h2>{m['hackertube.paths.about_title']()}</h2>
          <p>{m['hackertube.paths.about_text']()}</p>
          <Link href="/guide">
            {m['hackertube.paths.guide']()}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </section>
    </HackerTubeShell>
  );
}
