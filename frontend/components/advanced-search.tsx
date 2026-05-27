"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, X, TrendingUp, Clock, Loader2, Package, Store as StoreIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGetProductsQuery } from "@/store/api/productApi"
import { useGetStoresQuery } from "@/store/api/storeApi"
import { useGetCategoriesQuery } from "@/store/api/categoriesApi"

const RECENT_LIMIT = 5
const TRENDING = ["Silk Scarves", "Pottery", "Olive Oil", "Fashion", "Electronics"]

export function AdvancedSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load saved searches once
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soukly_recent_searches")
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch {
      /* ignore */
    }
  }, [])

  // Debounce input → API search term (skip empty)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const skip = debouncedQuery.length < 2
  const { data: productsData, isFetching: productsFetching } = useGetProductsQuery(
    skip ? undefined : { search: debouncedQuery },
    { skip },
  )
  const { data: storesData, isFetching: storesFetching } = useGetStoresQuery(
    skip ? undefined : { search: debouncedQuery },
    { skip },
  )
  const { data: categoriesData } = useGetCategoriesQuery()

  const isFetching = !skip && (productsFetching || storesFetching)

  const matchedCategories = useMemo(() => {
    if (skip) return []
    const q = debouncedQuery.toLowerCase()
    return (categoriesData?.data ?? []).filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4)
  }, [categoriesData, debouncedQuery, skip])

  const products = (productsData?.data ?? []).slice(0, 5)
  const stores   = (storesData?.data   ?? []).slice(0, 5)
  const totalResults = products.length + stores.length + matchedCategories.length

  const saveSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, RECENT_LIMIT)
    setRecentSearches(updated)
    try {
      localStorage.setItem("soukly_recent_searches", JSON.stringify(updated))
    } catch {
      /* ignore */
    }
  }

  const navigate = (href: string) => {
    saveSearch(query)
    setIsOpen(false)
    router.push(href)
  }

  const clearSearch = () => {
    setQuery("")
    setDebouncedQuery("")
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, stores, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-[60] max-h-[min(500px,60vh)] overflow-y-auto shadow-xl border-border/80">
            {query.length === 0 ? (
              <div className="space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent
                      </h4>
                      <button
                        onClick={() => {
                          setRecentSearches([])
                          localStorage.removeItem("soukly_recent_searches")
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuery(search)}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((trend) => (
                      <Badge
                        key={trend}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setQuery(trend)}
                      >
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : isFetching ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Searching…
              </div>
            ) : skip ? (
              <p className="text-center py-6 text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </p>
            ) : totalResults === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No results found for &quot;{debouncedQuery}&quot;</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.length > 0 && (
                  <Section title="Products" icon={Package}>
                    {products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={p.images?.[0]?.url ?? "/placeholder.svg"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-semibold text-primary">${Number(p.price).toFixed(2)}</span>
                            {p.store?.name && <span className="truncate">· {p.store.name}</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </Section>
                )}

                {stores.length > 0 && (
                  <Section title="Stores" icon={StoreIcon}>
                    {stores.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/store/${s.slug}`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            s.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {s.location && <span>{s.location}</span>}
                            {s.category?.name && <span>· {s.category.name}</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </Section>
                )}

                {matchedCategories.length > 0 && (
                  <Section title="Categories">
                    <div className="flex flex-wrap gap-2 px-1">
                      {matchedCategories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => navigate(`/stores?category=${c.slug}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background hover:bg-muted text-sm transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2 px-1">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
