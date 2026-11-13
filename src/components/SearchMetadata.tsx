import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Only the public home page has content intended for search results.
export function SearchMetadata() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots) robots.content = pathname === '/' && !search ? 'index, follow' : 'noindex, follow';
  }, [pathname, search]);

  return null;
}
