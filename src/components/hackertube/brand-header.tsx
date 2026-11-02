import { useId, useState, type ReactNode } from 'react';
import { Bookmark, Menu, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export function BrandWordmark({ name }: { name: string }) {
  return (
    <span className="ht-brand-wordmark">
      <img src="/brand/mark.svg" width="32" height="32" alt="" />
      <span>
        {name.replace(/\s+ai$/i, '').toLowerCase()}
        <span className="ht-brand-ai">ai</span>
      </span>
    </span>
  );
}

interface BrandHeaderProps {
  name: string;
  links: {
    href: string;
    label: string;
    active?: boolean;
    onClick?: () => void;
  }[];
  savedLabel: string;
  savedCount: number;
  menuLabel: string;
  closeLabel: string;
  tools?: ReactNode;
  onSaved: () => void;
}

export function BrandHeader({
  name,
  links,
  savedLabel,
  savedCount,
  menuLabel,
  closeLabel,
  tools,
  onSaved,
}: BrandHeaderProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const bookmark = (
    <>
      <Bookmark size={16} />
      <span>{savedLabel}</span>
      <span className="ht-saved-count">{savedCount}</span>
    </>
  );
  return (
    <header
      className="ht-brand-header"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <div className="ht-brand-header-inner">
        <Link href="/" className="ht-brand-home" aria-label={name}>
          <BrandWordmark name={name} />
        </Link>
        <nav
          id={menuId}
          className={`ht-brand-nav ${open ? 'is-open' : ''}`}
          aria-label={menuLabel}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              onClick={() => {
                setOpen(false);
                link.onClick?.();
              }}
            >
              {link.label}
            </Link>
          ))}
          <div className="ht-brand-nav-tools">{tools}</div>
        </nav>
        <div className="ht-brand-tools">
          <button
            type="button"
            className="ht-collection-button"
            aria-label={savedLabel}
            onClick={() => {
              setOpen(false);
              onSaved();
            }}
          >
            {bookmark}
          </button>
          <button
            type="button"
            className="ht-mobile-menu"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? closeLabel : menuLabel}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
