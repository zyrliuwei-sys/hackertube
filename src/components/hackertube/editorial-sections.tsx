import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { BrandWordmark } from '@/components/hackertube/brand-header';

export interface EditorialCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  countLabel: string;
}

export interface EditorialOrigin {
  eyebrow: string;
  title: string;
  description: string;
  guideLabel: string;
  originalLabel: string;
  originalUrl: string;
}

export interface EditorialSectionsProps {
  children?: ReactNode;
  collections: EditorialCollection[];
  heading: string;
  subheading: string;
  onSelect: (areaId: string) => void;
  origin: EditorialOrigin;
  onGuide: () => void;
}

export function EditorialSections({
  children,
  collections,
  heading,
  subheading,
  onSelect,
  origin,
  onGuide,
}: EditorialSectionsProps) {
  return (
    <div className="ht-editorial">
      <section
        id="collections"
        className="ht-collections"
        aria-labelledby="ht-collections-heading"
      >
        <div className="ht-collections-heading">
          <h2 id="ht-collections-heading">{heading}</h2>
          <p>{subheading}</p>
        </div>
        <div className="ht-collections-grid">
          {collections.map((collection) => (
            <button
              className="ht-collection"
              key={collection.id}
              type="button"
              onClick={() => onSelect(collection.id)}
            >
              <img
                src={collection.image}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="ht-collection-shade" aria-hidden="true" />
              <span className="ht-collection-content">
                <span className="ht-collection-count">
                  {collection.countLabel}
                </span>
                <span className="ht-collection-title-row">
                  <span className="ht-collection-title">
                    {collection.title}
                  </span>
                  <ArrowRight size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="ht-collection-description">
                  {collection.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {children}

      <section className="ht-origin" aria-labelledby="ht-origin-heading">
        <div className="ht-origin-copy">
          <p className="ht-origin-eyebrow">{origin.eyebrow}</p>
          <h2 id="ht-origin-heading">{origin.title}</h2>
          <p className="ht-origin-description">{origin.description}</p>
        </div>
        <div className="ht-origin-links">
          <button type="button" onClick={onGuide}>
            <span>{origin.guideLabel}</span>
            <ArrowRight size={21} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <a
            href={origin.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{origin.originalLabel}</span>
            <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}

export interface HackerFooterProps {
  name: string;
  tagline: string;
  independence: string;
  guideLabel: string;
  privacyLabel: string;
  termsLabel: string;
  originalLabel: string;
  onGuide: () => void;
  dataCredit: string;
  licenseLabel: string;
  cookieLabel?: string;
  onCookieSettings?: () => void;
  badges?: ReactNode;
}

export function HackerFooter({
  name,
  tagline,
  independence,
  guideLabel,
  privacyLabel,
  termsLabel,
  originalLabel,
  dataCredit,
  licenseLabel,
  cookieLabel,
  onCookieSettings,
  badges,
  onGuide,
}: HackerFooterProps) {
  return (
    <footer className="ht-footer">
      <div className="ht-footer-main">
        <div className="ht-footer-brand">
          <Link href="/" className="ht-footer-wordmark" aria-label={name}>
            <BrandWordmark name={name} />
          </Link>
          <p className="ht-footer-tagline">{tagline}</p>
          <p className="ht-footer-independence">{independence}</p>
          <p className="ht-footer-data-credit">
            {dataCredit}{' '}
            <a
              href="https://hackertube.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              HackerTube
            </a>{' '}
            +{' '}
            <a
              href="https://huggingface.co/datasets/open-index/hacker-news"
              target="_blank"
              rel="noopener noreferrer"
            >
              open-index/hacker-news
            </a>
            .{' '}
            <a
              href="https://opendatacommons.org/licenses/by/1-0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {licenseLabel}
            </a>
          </p>
        </div>
        <nav className="ht-footer-nav" aria-label={name}>
          <button type="button" onClick={onGuide}>
            {guideLabel}
          </button>
          <a
            href="https://hackertube.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {originalLabel}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Link href="/privacy-policy">{privacyLabel}</Link>
          <Link href="/terms-of-service">{termsLabel}</Link>
          {onCookieSettings && (
            <button onClick={onCookieSettings}>{cookieLabel}</button>
          )}
        </nav>
      </div>
      {badges}
    </footer>
  );
}
