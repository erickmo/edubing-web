/**
 * Breadcrumb — compact trail above the event hero.
 *
 * Renders "Beranda › Event › {title}". The last crumb is the current page
 * (no link, emphasized). Earlier crumbs link to their routes. Visual JSON-LD
 * BreadcrumbList is emitted separately by the page's Seo component.
 */

import { Link } from "react-router-dom";

/** One crumb in the trail. `to` omitted → current (non-link) page. */
export interface Crumb {
  label: string;
  to?: string;
}

/** Props for Breadcrumb. */
export interface BreadcrumbProps {
  items: Crumb[];
}

/**
 * Renders an accessible breadcrumb navigation trail.
 * The separator "›" is decorative and hidden from assistive tech.
 */
export function Breadcrumb({ items }: BreadcrumbProps): JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="font-semibold transition-colors hover:text-brand-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="max-w-[18rem] truncate font-bold text-ink"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-ink-muted/60">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
