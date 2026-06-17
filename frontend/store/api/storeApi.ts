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
  youtube: string | null
  twitter: string | null
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
  // Present on admin endpoints (GET /admin/stores, /admin/stores/:id) only.
  owner?: { id: string; name: string; email: string; phone?: string | null; created_at?: string }
}

export interface PaginatedStores {
  data: Store[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded"

export interface SubscriptionPayment {
  id: string
  store_id: string
  invoice_number: string
  plan_id: string
  amount: number
  currency: string
  status: PaymentStatus
  period_start: string
  period_end: string
  payment_method: string
  paid_at: string | null
  createdAt?: string
}

export interface BillingHistory {
  payments: SubscriptionPayment[]
  summary: {
    total_paid: number
    currency: string
    payments_count: number
    member_since: string | null
    last_payment_at: string | null
  }
}

// Admin: a subscription payment annotated with the owning store.
export interface AdminPayment extends SubscriptionPayment {
  store?: { id: string; name: string; slug: string }
}

export interface AdminBilling {
  data: AdminPayment[]
  total: number
  limit: number
  offset: number
  has_more: boolean
  summary: {
    total_revenue: number
    pending_amount: number
    refunded_amount: number
    paid_count: number
    pending_count: number
    failed_count: number
    refunded_count: number
    active_subscriptions: number
    trialing_subscriptions: number
    mrr: number
    currency: string
  }
}

// Admin: full operational detail for a single store.
export interface AdminStoreDetail {
  store: Store & {
    owner?: { id: string; name: string; email: string; phone: string | null; created_at: string }
    created_at?: string
    review_count?: number
  }
  stats: {
    product_count: number
    order_count: number
    follower_count: number
    review_count: number
    rating: number
    gmv: number
    subscription_revenue: number
  }
  payments: SubscriptionPayment[]
  recent_orders: Array<{
    id: string
    status: string
    total: number | string
    total_amount?: number
    created_at: string
    shipping_address?: { name?: string }
    items?: unknown[]
  }>
}

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<
      PaginatedStores,
      { search?: string; category?: string; location?: string; sort?: "popular" | "rating" | "newest"; limit?: number; offset?: number } | void
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
    // Admin-only: full operational detail for one store (owner, stats, billing,
    // recent orders). Hits /admin/stores/:id, which ignores approval status.
    getAdminStoreDetail: builder.query<AdminStoreDetail, string>({
      query: (id) => `/admin/stores/${id}`,
      transformResponse: (res: AdminStoreDetail) => ({
        ...res,
        store: numerify(res.store, STORE_NUM_FIELDS) as AdminStoreDetail["store"],
        payments: res.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
        recent_orders: res.recent_orders.map((o) => ({
          ...o,
          total_amount: Number(o.total_amount ?? o.total),
        })),
      }),
      providesTags: (_r, _e, id) => [{ type: "Store", id }],
    }),
    // Admin-only: platform-wide subscription billing feed + summary.
    getAdminBilling: builder.query<AdminBilling, { status?: PaymentStatus; limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/admin/billing", params: params ?? {} }),
      transformResponse: (res: AdminBilling) => ({
        ...res,
        data: res.data.map((p) => ({ ...p, amount: Number(p.amount) })),
        summary: {
          ...res.summary,
          total_revenue: Number(res.summary.total_revenue),
          pending_amount: Number(res.summary.pending_amount),
          refunded_amount: Number(res.summary.refunded_amount),
          mrr: Number(res.summary.mrr),
        },
      }),
      providesTags: ["Billing"],
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
      invalidatesTags: ["Store", "Billing"],
    }),
    // Seller: upgrade/downgrade between starter | pro | premium
    changeMyPlan: builder.mutation<Store, { plan_id: string }>({
      query: (body) => ({ url: "/stores/me/subscription/plan", method: "PATCH", body }),
      transformResponse: (res: Store) => numerify(res, STORE_NUM_FIELDS),
      invalidatesTags: ["Store", "Billing"],
    }),
    uploadStoreImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({ url: "/stores/me/store/upload-image", method: "POST", body: formData }),
    }),
    // Admin: update a subscription payment's status (mark paid / failed /
    // refunded / pending) while Whish billing is pending.
    updateAdminPayment: builder.mutation<AdminPayment, { id: string; status: PaymentStatus }>({
      query: ({ id, status }) => ({ url: `/admin/billing/${id}`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Billing"],
    }),
    // Seller: billing history (subscription charges) for own store
    getMyPayments: builder.query<BillingHistory, void>({
      query: () => "/stores/me/subscription/payments",
      transformResponse: (res: BillingHistory) => ({
        ...res,
        payments: res.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
        summary: { ...res.summary, total_paid: Number(res.summary.total_paid) },
      }),
      providesTags: ["Billing"],
    }),
  }),
})

export const {
  useGetStoresQuery,
  useGetAdminStoresQuery,
  useGetAdminStoreDetailQuery,
  useGetAdminBillingQuery,
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
  useUpdateAdminPaymentMutation,
  useGetMyPaymentsQuery,
} = storeApi
