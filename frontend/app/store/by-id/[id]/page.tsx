"use client"

import { use } from "react"
import { useGetStoreByIdQuery } from "@/store/api/storeApi"
import { useGetProductsQuery } from "@/store/api/productApi"
import StorePageContent from "@/components/store-page-content"
import { StoreLoadingShell, StoreNotFoundShell } from "@/components/storefront/store-loading-shell"

export default function StoreByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: store, isLoading: storeLoading, isError } = useGetStoreByIdQuery(id)

  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(
    store ? { store_id: store.id } : undefined,
    { skip: !store },
  )
  const products = productsData?.data ?? []

  if (storeLoading) return <StoreLoadingShell />
  if (isError || !store) return <StoreNotFoundShell message="No store with that id." />

  return <StorePageContent store={store} products={products} productsLoading={productsLoading} />
}
