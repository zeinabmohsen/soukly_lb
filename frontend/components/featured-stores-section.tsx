"use client"

import Link from "next/link"
import { Store as StoreIcon, Star, MapPin, ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetStoresQuery } from "@/store/api/storeApi"
import Reveal from "@/components/reveal"

export default function FeaturedStoresSection() {
  const { data, isLoading } = useGetStoresQuery({ sort: "popular", limit: 8 })
  const stores = data?.data ?? []

  // Don't render an empty section on the landing page if there are no stores yet.
  if (!isLoading && stores.length === 0) return null

  return (
    <section id="featured-stores" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <Reveal className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
            <StoreIcon className="h-4 w-4" />
            <span>Live on Soukly</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            Discover <span className="text-primary">Lebanese stores</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Real shops, real sellers — already trading across Lebanon. Yours could be next.
          </p>
          <Link href="/marketplace" className="mt-8">
            <Button variant="outline" size="lg" className="group bg-transparent gap-2">
              Explore marketplace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-28 md:h-36 w-full" />
                  <div className="p-3 md:p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </Card>
              ))
            : stores.map((store, index) => (
                <Link key={store.id} href={`/store/${store.slug}`} className="block h-full">
                  <Card
                    className="group h-full flex flex-col overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    style={{ animation: `slide-up 0.5s ease-out ${index * 60}ms both` }}
                  >
                    <div className="relative h-28 md:h-36 shrink-0 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                      {store.cover_url || store.logo_url ? (
                        <img
                          src={store.cover_url ?? store.logo_url ?? ""}
                          alt={store.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl md:text-4xl font-bold text-primary/40">
                            {store.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {store.is_approved && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-primary-foreground gap-1 text-[10px] md:text-xs">
                            <TrendingUp className="w-3 h-3" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <h3 className="text-sm md:text-base font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1 break-words">
                        {store.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2rem] break-words">
                        {store.description ?? "Explore our curated collection"}
                      </p>
                      <div className="flex items-center gap-3 text-xs mt-auto">
                        {store.rating > 0 && (
                          <span className="flex items-center gap-1 text-amber-500 font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {store.rating.toFixed(1)}
                          </span>
                        )}
                        {store.location && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {store.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
