import { useEffect } from 'react';

const SITE_NAME = 'Capacity Connect';
const SITE_URL = 'https://www.capacityconnect.example.com'; // TODO: replace with your real custom domain

interface SEOOptions {
  /** Page-specific title. Will be rendered as "{title} | Capacity Connect". */
  title: string;
  /** Page-specific meta description (~150-160 chars is ideal). */
  description?: string;
  /** Optional path (e.g. "/login") used to build the canonical URL. Defaults to current path. */
  path?: string;
  /** Set true to add <meta name="robots" content="noindex,nofollow" /> on private/dashboard pages. */
  noindex?: boolean;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Lightweight, dependency-free replacement for react-helmet.
 * Sets a unique document title, meta description, canonical link, and
 * robots directive per route. Call this once at the top of every page
 * component, e.g.:
 *
 *   useSEO({ title: 'My Courses', description: 'Browse and manage your courses.' });
 */
export function useSEO({ title, description, path, noindex }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('name', 'twitter:title', fullTitle);

    const canonicalPath = path ?? window.location.pathname;
    const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
    let link = document.getElementById('canonical-link') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.id = 'canonical-link';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
    setMetaTag('property', 'og:url', canonicalUrl);

    // Dashboard/authenticated pages shouldn't be indexed by search engines.
    let robotsTag = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (noindex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex, nofollow');
    } else if (robotsTag) {
      robotsTag.remove();
    }
  }, [title, description, path, noindex]);
}
