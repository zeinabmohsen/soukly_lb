// Sequelize returns DECIMAL columns as strings (e.g. "45.00") to preserve
// precision. Frontend types declare them as numbers, so coerce at the slice
// boundary via `transformResponse` and downstream consumers can do math safely.

type AnyRecord = Record<string, unknown>

function numerifyOne<T>(obj: T | null | undefined, fields: string[]): T {
  if (!obj || typeof obj !== "object") return obj as T
  const out = { ...(obj as AnyRecord) }
  for (const f of fields) {
    const v = out[f]
    if (v !== undefined && v !== null) out[f] = Number(v)
  }
  return out as T
}

export function numerify<T>(obj: T | null | undefined, fields: string[]): T {
  return numerifyOne(obj, fields)
}

export function numerifyList<T>(items: T[] | undefined, fields: string[]): T[] {
  if (!items) return items as unknown as T[]
  return items.map((i) => numerifyOne(i, fields))
}

// Paginated payloads: { data: [...], total, limit, offset, has_more }
export function numerifyPaginated<T extends { data?: unknown[] }>(
  payload: T,
  fields: string[],
): T {
  if (!payload?.data) return payload
  return { ...payload, data: numerifyList(payload.data as unknown[], fields) } as T
}

// Numeric fields per resource
export const STORE_NUM_FIELDS = ["rating"]
export const PRODUCT_NUM_FIELDS = ["price", "compare_at_price", "rating"]
export const ORDER_NUM_FIELDS = ["total_amount"]
export const ORDER_ITEM_NUM_FIELDS = ["unit_price"]
export const REVIEW_NUM_FIELDS = ["rating"]

// ─── Pagination helpers (RTK Query infinite-scroll pattern) ──────────────────
// Use these in builder.query options so pages with the same filters share a
// single cache entry. Bumping `offset` appends; changing any filter swaps to
// a fresh cache entry (and the page should reset offset to 0 in that case).

type PaginatedArgs = { offset?: number; limit?: number } | void
type PaginatedPayload<T> = {
  data: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export function paginatedSerializeQueryArgs(endpointName: string) {
  return ({ queryArgs }: { queryArgs: PaginatedArgs }) => {
    const args = queryArgs ?? {}
    const { offset: _offset, ...rest } = args as Record<string, unknown>
    return `${endpointName}-${JSON.stringify(rest)}`
  }
}

export function paginatedMerge<T>(
  currentCache: PaginatedPayload<T>,
  newItems: PaginatedPayload<T>,
) {
  if (!newItems.offset || newItems.offset === 0) {
    Object.assign(currentCache, newItems)
  } else {
    currentCache.data.push(...newItems.data)
    currentCache.total = newItems.total
    currentCache.offset = newItems.offset
    currentCache.has_more = newItems.has_more
    currentCache.limit = newItems.limit
  }
}

export function paginatedForceRefetch({
  currentArg,
  previousArg,
}: {
  currentArg: PaginatedArgs
  previousArg: PaginatedArgs
}) {
  return (currentArg as { offset?: number } | undefined)?.offset !== (previousArg as { offset?: number } | undefined)?.offset
}
