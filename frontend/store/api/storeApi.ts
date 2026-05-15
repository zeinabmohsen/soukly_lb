import { baseApi } from "./baseApi"
import {
  numerify,
  numerifyPaginated,
  STORE_NUM_FIELDS,
  paginatedSerializeQueryArgs,
  paginatedMerge,
  paginatedForceRefetch,
} from "./_normalize"

export interface StoreCategory {
  id: string
  store_id: string
  name: string
  slug: string
  sort_order: number
}

export type SubscriptionStatus = "inactive" | "trialing" | "active" | "lapsed" | "cancelled"

export interface Store {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  location: string | null
  global_category_id: string | null
  whatsapp: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  is_approved: boolean
  rating: number
  hero: Record<string, unknown> | null
  footer: Record<string, unknown> | null
  // Subscription state — populated for all stores; gates marketplace visibility
  subscription_status: SubscriptionStatus
  plan_id: string | null
  trial_ends_at: string | null
  next_billing_at: string | null
  is_founding_seller: boolean
  category?: { id: string; name: string; slug: string; icon?: string }
  StoreCategories?: StoreCategory[]
}

export interface PaginatedStores {
  data: Store[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<
      PaginatedStores,
      { search?: string; category?: string; location?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: "/stores", params: params ?? {} }),
      transformResponse: (res: PaginatedStores) => numerifyPaginated(res, STORE_NUM_FIELDS),
      serializeQueryArgs: paginatedSerializeQueryArgs("getStores"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Store"],
    }),
    // Admin-only: lists every store, including unapproved. The public /stores
    // endpoint forces is_approved=true, which hid pending sellers from the queue.
    getAdminStores: builder.query<
      PaginatedStores,
      { status?: "pending" | "approved" | "all"; search?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: "/admin/stores", params: params ?? {} }),
      transformResponse: (res: PaginatedStores) => numerifyPaginated(res, STORE_NUM_FIELDS),
      providesTags: ["Store"],
    }),
    getStoreBySlug: builder.query<Store, string>({
      query: (slug) => `/stores/${slug}`,
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      providesTags: (_r, _e, slug) => [{ type: "Store", id: slug }],
    }),
    getStoreById: builder.query<Store, string>({
      query: (id) => `/stores/by-id/${id}`,
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      providesTags: (_r, _e, id) => [{ type: "Store", id }],
    }),
    getMyStore: builder.query<Store, void>({
      query: () => "/stores/me/store",
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      providesTags: [{ type: "Store", id: "me" }],
    }),
    createStore: builder.mutation<Store, Partial<Store>>({
      query: (data) => ({ url: "/stores", method: "POST", body: data }),
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      invalidatesTags: ["Store"],
    }),
    updateMyStore: builder.mutation<Store, Partial<Store>>({
      query: (data) => ({ url: "/stores/me/store", method: "PATCH", body: data }),
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      invalidatesTags: ["Store"],
    }),
    getStoreCategories: builder.query<StoreCategory[], string>({
      query: (storeId) => `/stores/${storeId}/categories`,
      providesTags: ["StoreCategory"],
    }),
    createStoreCategory: builder.mutation<StoreCategory, { name: string }>({
      query: (data) => ({ url: "/stores/me/store/categories", method: "POST", body: data }),
      invalidatesTags: ["StoreCategory"],
    }),
    updateStoreCategory: builder.mutation<StoreCategory, { id: string; name: string }>({
      query: ({ id, ...data }) => ({ url: `/stores/me/store/categories/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["StoreCategory"],
    }),
    deleteStoreCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/stores/me/store/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["StoreCategory"],
    }),
    reorderStoreCategories: builder.mutation<StoreCategory[], { ids: string[] }>({
      query: (data) => ({ url: "/stores/me/store/categories/reorder", method: "PATCH", body: data }),
      invalidatesTags: ["StoreCategory"],
    }),
    approveStore: builder.mutation<Store, { id: string; approved: boolean }>({
      query: ({ id, approved }) => ({ url: `/stores/${id}/approval`, method: "PATCH", body: { approved } }),
      invalidatesTags: ["Store"],
    }),
    // Admin: manually change any subscription field on a store. Used while
    // Whish payment integration is pending — admin flips status by hand.
    setStoreSubscription: builder.mutation<
      Store,
      {
        id: string
        subscription_status?: SubscriptionStatus
        plan_id?: string | null
        trial_ends_at?: string | null
        next_billing_at?: string | null
        is_founding_seller?: boolean
      }
    >({
      query: ({ id, ...body }) => ({ url: `/stores/${id}/subscription`, method: "PATCH", body }),
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      invalidatesTags: ["Store"],
    }),
    // Seller: start the 30-day free trial (requires admin approval first)
    startMyTrial: builder.mutation<Store, void>({
      query: () => ({ url: "/stores/me/subscription/start-trial", method: "POST" }),
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      invalidatesTags: ["Store"],
    }),
    // Seller: upgrade/downgrade between starter | pro | premium
    changeMyPlan: builder.mutation<Store, { plan_id: string }>({
      query: (body) => ({ url: "/stores/me/subscription/plan", method: "PATCH", body }),
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      invalidatesTags: ["Store"],
    }),
    uploadStoreImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({ url: "/stores/me/store/upload-image", method: "POST", body: formData }),
    }),
  }),
})

export const {
  useGetStoresQuery,
  useGetAdminStoresQuery,
  useGetStoreBySlugQuery,
  useGetStoreByIdQuery,
  useGetMyStoreQuery,
  useCreateStoreMutation,
  useUpdateMyStoreMutation,
  useGetStoreCategoriesQuery,
  useCreateStoreCategoryMutation,
  useUpdateStoreCategoryMutation,
  useDeleteStoreCategoryMutation,
  useReorderStoreCategoriesMutation,
  useApproveStoreMutation,
  useSetStoreSubscriptionMutation,
  useStartMyTrialMutation,
  useChangeMyPlanMutation,
  useUploadStoreImageMutation,
} = storeApi
