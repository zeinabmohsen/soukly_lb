import { baseApi } from "./baseApi"

export type DiscountType = "percentage" | "fixed"

export interface Promotion {
  id: string
  store_id: string
  code: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  min_order_amount: number | null
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Payload for create/update. All optional on update; create requires code +
// discount_value (enforced server-side).
export interface PromotionInput {
  code?: string
  description?: string | null
  discount_type?: DiscountType
  discount_value?: number
  min_order_amount?: number | null
  max_discount?: number | null
  usage_limit?: number | null
  starts_at?: string | null
  ends_at?: string | null
  is_active?: boolean
}

// Coupon validation result returned to the checkout coupon box.
export interface ValidatedPromotion {
  promotion: {
    id: string
    code: string
    description: string | null
    discount_type: DiscountType
    discount_value: number
    min_order_amount: number | null
    max_discount: number | null
    store: { id: string; name: string; slug: string }
  }
  meets_minimum: boolean
  discount: number | null
}

function numerify(p: Promotion): Promotion {
  return {
    ...p,
    discount_value: Number(p.discount_value),
    min_order_amount: p.min_order_amount != null ? Number(p.min_order_amount) : null,
    max_discount: p.max_discount != null ? Number(p.max_discount) : null,
    usage_limit: p.usage_limit != null ? Number(p.usage_limit) : null,
    used_count: Number(p.used_count),
  }
}

export const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Seller: list own promotions
    getMyPromotions: builder.query<Promotion[], void>({
      query: () => "/promotions/mine",
      transformResponse: (res: { data: Promotion[] }) => (res.data ?? []).map(numerify),
      providesTags: ["Promotion"],
    }),
    createPromotion: builder.mutation<Promotion, PromotionInput>({
      query: (body) => ({ url: "/promotions", method: "POST", body }),
      transformResponse: numerify,
      invalidatesTags: ["Promotion"],
    }),
    updatePromotion: builder.mutation<Promotion, { id: string } & PromotionInput>({
      query: ({ id, ...body }) => ({ url: `/promotions/${id}`, method: "PATCH", body }),
      transformResponse: numerify,
      invalidatesTags: ["Promotion"],
    }),
    deletePromotion: builder.mutation<void, string>({
      query: (id) => ({ url: `/promotions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Promotion"],
    }),
    // Buyer: validate a code at checkout (preview the discount)
    validatePromotion: builder.mutation<ValidatedPromotion, { code: string; subtotal?: number }>({
      query: (body) => ({ url: "/promotions/validate", method: "POST", body }),
    }),
  }),
})

export const {
  useGetMyPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useValidatePromotionMutation,
} = promotionApi
