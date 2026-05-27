"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, TrendingUp, ArrowRight } from "lucide-react"
import { useGetStoresQuery } from "@/store/api/storeApi"

export default function TopStoresSection() {
  const { data, isLoading } = useGetStoresQuery()
  const stores = data?.data?.slice(0, 6) ?? []

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Top Stores</h2>
            <p className="text-lg text-muted-foreground">Discover the most loved shops in Lebanon</p>
          </div>
          <Link href="/stores">
            <Button variant="outline" size="lg" className="hidden md:flex gap-2 bg-transparent">
              View All Stores
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-32 md:h-48 w-full" />
                  <div className="p-3 md:p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </Card>
              ))
            : stores.map((store, index) => (
                <Link key={store.id} href={`/store/${store.slug}`}>
                  <Card
                    className="group overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-32 md:h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      {store.cover_url || store.logo_url ? (
                        <img
                          src={store.cover_url ?? store.logo_url ?? ""}
                          alt={store.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl md:text-5xl font-bold text-primary/40">
                            {store.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {store.is_approved && (
                        <div className="absolute top-2 md:top-4 left-2 md:left-4 flex gap-2">
                          <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                            <TrendingUp className="w-3 h-3" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-3 md:p-6">
                      <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-1 break-words">
                        {store.name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-1 md:line-clamp-2 min-h-[1.1rem] md:min-h-[2.75rem] break-words">
                        {store.description ?? "Explore our curated collection"}
                      </p>

                      <div className="flex items-center gap-3 text-sm mb-2 md:mb-4">
                        {store.rating > 0 && (
                          <span className="flex items-center gap-1 text-amber-500 font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {store.rating.toFixed(1)}
                          </span>
                        )}
                        {store.location && (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <MapPin className="w-3 h-3" />
                            {store.location}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 md:pt-4 border-t">
                        {/* Mobile: stack category above a full-width Visit CTA */}
                        <div className="md:hidden space-y-2">
                          {store.category && (
                            <span className="block text-[11px] text-muted-foreground line-clamp-1">
                              {store.category.name}
                            </span>
                          )}
                          <Button
                            size="sm"
                            className="w-full gap-1 h-9 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            Visit Store
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        {/* Desktop: side-by-side */}
                        <div className="hidden md:flex items-center justify-between">
                          {store.category && (
                            <span className="text-sm text-muted-foreground">{store.category.name}</span>
                          )}
                          <Button
                            size="sm"
                            className="ml-auto gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            Visit
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/stores">
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              View All Stores
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
