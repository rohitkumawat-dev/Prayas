import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string; // omit for the current (last) page
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

/**
 * Renders a visible breadcrumb trail AND a matching BreadcrumbList JSON-LD
 * block, so both users and search engines get the page's position in the
 * site hierarchy. Always prepends "Home" (/) as the first crumb.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems: Crumb[] = [{ label: 'Home', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://www.capacityconnect.example.com${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li className="flex items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link to={item.href} className="hover:text-slate-200 transition-colors flex items-center gap-1">
                    {i === 0 && <Home className="w-3.5 h-3.5" />}
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-slate-300">{item.label}</span>
                )}
              </li>
              {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
