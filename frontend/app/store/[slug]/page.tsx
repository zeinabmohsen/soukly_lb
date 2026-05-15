"use client"

import { use } from "react"
import { useGetStoreBySlugQuery } from "@/store/api/storeApi"
import { useGetProductsQuery } from "@/store/api/productApi"
import StorePageContent from "@/components/store-page-content"
import { StoreLoadingShell, StoreNotFoundShell } from "@/components/storefront/store-loading-shell"

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: store, isLoading: storeLoading, isError } = useGetStoreBySlugQuery(slug)

  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(
    store ? { store_id: store.id } : undefined,
    { skip: !store },
  )
  const products = productsData?.data ?? []

  if (storeLoading) return <StoreLoadingShell />
  if (isError || !store) return <StoreNotFoundShell />

  return <StorePageContent store={store} products={products} productsLoading={productsLoading} />
}
