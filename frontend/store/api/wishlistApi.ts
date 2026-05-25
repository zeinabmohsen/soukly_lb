import { baseApi } from "./baseApi"
import {
  numerify,
  PRODUCT_NUM_FIELDS,
  paginatedSerializeQueryArgs,
  paginatedMerge,
  paginatedForceRefetch,
} from "./_normalize"

function normalizeWishlistEntry(entry: WishlistEntry): WishlistEntry {
  if (!entry.product) return entry
  return { ...entry, product: numerify(entry.product, PRODUCT_NUM_FIELDS) }
}

export interface WishlistEntry {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: {
    id: string
    name: string
    slug: string
    price: number
    compare_at_price: number | null
    images: { url: string; alt?: string }[]
    status: string
    rating: number
    stock: number
    store_id: string
    store?: { id: string; name: string; slug: string; logo_url: string | null }
    category?: { id: string; name: string; slug: string }
  }
}

export interface FollowEntry {
  id: string
  user_id: string
  store_id: string
  created_at: string
  store?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    cover_url: string | null
    rating: number
    location: string | null
  }
}

interface PaginatedWishlist {
  data: WishlistEntry[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

interface PaginatedFollows {
  data: FollowEntry[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWishlist: builder.query<PaginatedWishlist, { limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/wishlist", params: params ?? {} }),
      transformResponse: (res: PaginatedWishlist) => ({
        ...res,
        data: res.data?.map(normalizeWishlistEntry) ?? [],
      }),
      serializeQueryArgs: paginatedSerializeQueryArgs("getMyWishlist"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Wishlist"],
    }),
    addProductToWishlist: builder.mutation<{ message: string }, string>({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: "POST" }),
      invalidatesTags: ["Wishlist"],
    }),
    removeProductFromWishlist: builder.mutation<void, string>({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: "DELETE" }),
      invalidatesTags: ["Wishlist"],
    }),
    checkWishlisted: builder.query<{ wishlisted: string[] }, string>({
      query: (ids) => ({ url: "/wishlist/check", params: { ids } }),
      providesTags: ["Wishlist"],
    }),
    getFollowedStores: builder.query<PaginatedFollows, { limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/wishlist/stores", params: params ?? {} }),
      serializeQueryArgs: paginatedSerializeQueryArgs("getFollowedStores"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Wishlist"],
    }),
    followStore: builder.mutation<{ message: string }, string>({
      query: (storeId) => ({ url: `/wishlist/stores/${storeId}`, method: "POST" }),
      invalidatesTags: ["Wishlist"],
    }),
    unfollowStore: builder.mutation<void, string>({
      query: (storeId) => ({ url: `/wishlist/stores/${storeId}`, method: "DELETE" }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
})

export const {
  useGetMyWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
  useCheckWishlistedQuery,
  useGetFollowedStoresQuery,
  useFollowStoreMutation,
  useUnfollowStoreMutation,
} = wishlistApi
