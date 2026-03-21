export function createPageUrl(pageName) {
  if (!pageName) return '/';
  const [page, query] = pageName.split('?');
  if (page === 'Home') return query ? `/?${query}` : '/';
  const slug = page.replace(/ /g, '-');
  return query ? `/${slug}?${query}` : `/${slug}`;
}
