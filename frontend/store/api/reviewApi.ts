import { baseApi } from "./baseApi"

export interface Review {
  id: string
  user_id: string
  product_id: string
  store_id: string
  order_id: string | null
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user?: { id: string; name: string; avatar_url: string | null }
  product?: { id: string; name: string; slug: string }
}

interface PaginatedReviews {
  data: Review[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<PaginatedReviews, string>({
      query: (productId) => `/reviews/products/${productId}`,
      providesTags: (_r, _e, productId) => [{ type: "Review", id: `product-${productId}` }],
    }),
    getStoreReviews: builder.query<PaginatedReviews, string>({
      query: (storeId) => `/reviews/stores/${storeId}`,
      providesTags: (_r, _e, storeId) => [{ type: "Review", id: `store-${storeId}` }],
    }),
    getMyReviews: builder.query<PaginatedReviews, void>({
      query: () => "/reviews/mine",
      providesTags: ["Review"],
    }),
    createReview: builder.mutation<Review, { product_id: string; rating: number; comment?: string; order_id?: string }>({
      query: (data) => ({ url: "/reviews", method: "POST", body: data }),
      invalidatesTags: (_r, _e, { product_id }) => [
        { type: "Review", id: `product-${product_id}` },
        "Review",
        "Product",
      ],
    }),
    updateReview: builder.mutation<Review, { id: string; rating?: number; comment?: string }>({
      query: ({ id, ...data }) => ({ url: `/reviews/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["Review", "Product"],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: ["Review", "Product"],
    }),
  }),
})

export const {
  useGetProductReviewsQuery,
  useGetStoreReviewsQuery,
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi
