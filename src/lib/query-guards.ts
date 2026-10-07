const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'name',
  'title',
  'price',
  'order',
  'publishedAt',
  'views',
  'featured',
  'breed',
])

export function safeSortField(sort: string | undefined, fallback = 'createdAt'): string {
  if (sort && ALLOWED_SORT_FIELDS.has(sort)) return sort
  return fallback
}
