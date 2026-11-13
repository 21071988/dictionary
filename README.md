# dictionary
sprog cards + vocabulary for learning danish

## Search engines

The public home page contains an English introduction, search and social metadata,
a canonical URL and WebApplication structured data. Account screens are excluded
from indexing; the sitemap contains only the public home page.

The production URL is `https://21071988.github.io/dictionary/` (GitHub Pages).
When changing domains, update `index.html`, `public/sitemap.xml` and
`public/robots.txt` together.

After deploying:

1. Verify ownership in Google Search Console and Bing Webmaster Tools.
2. Submit `https://21071988.github.io/dictionary/sitemap.xml` and request inspection
   of the home page.
3. Check the rendered page and indexing status in those tools.

Robots.txt must be served at the **origin root** to be used by crawlers.
GitHub project Pages publishes this file at `/dictionary/robots.txt`, where it
is informational only. If you control the `21071988.github.io` root site, add the
sitemap directive to its `/robots.txt`. The sitemap can also be submitted directly
without a root robots.txt. Do not block private routes in robots.txt: crawlers
need to access them to see their `noindex` metadata. Authentication protects data;
SEO metadata does not provide access control.

Search engines decide whether and when to index pages; these changes do not
guarantee rankings or indexing.
