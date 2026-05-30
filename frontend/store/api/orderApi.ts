import { baseApi } from "./baseApi"
import {
  numerify,
  numerifyList,
  ORDER_NUM_FIELDS,
  ORDER_ITEM_NUM_FIELDS,
  paginatedSerializeQueryArgs,
  paginatedMerge,
  paginatedForceRefetch,
} from "./_normalize"

function normalizeOrder(o: Order): Order {
  // The API serializes the Sequelize model directly, so it sends `total` and
  // the `items` association alias. The frontend type uses `total_amount` and
  // `OrderItems`, so bridge the names here (at the single slice boundary)
  // before numerifying — otherwise every order reads as $0 with no line items.
  const raw = o as unknown as Record<string, unknown>
  const mapped = {
    ...o,
    total_amount: (raw.total_amount ?? raw.total) as number,
    OrderItems: (raw.OrderItems ?? raw.items) as OrderItem[] | undefined,
  }
  const out = numerify(mapped, ORDER_NUM_FIELDS)
  if (out.OrderItems) out.OrderItems = numerifyList(out.OrderItems, ORDER_ITEM_NUM_FIELDS)
  return out
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  product_snapshot: {
    id: string
    name: string
    price: number
    image_url: string | null
    sku: string | null
    slug: string
  }
}

export interface Order {
  id: string
  buyer_id: string
  store_id: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  shipping_address: {
    name: string
    phone: string
    email: string
    address: string
    city?: string
    country?: string
  }
  payment_method: "cash_on_delivery" | "card"
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  OrderItems?: OrderItem[]
  store?: { id: string; name: string; slug: string }
}

export interface CheckoutPayload {
  items: { product_id: string; quantity: number }[]
  shipping_address: {
    name: string
    phone: string
    email: string
    address: string
    city?: string
    country?: string
  }
  payment_method: "cash_on_delivery" | "card"
  notes?: string
}

interface PaginatedOrders {
  data: Order[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation<{ message: string; orders: Order[] }, CheckoutPayload>({
      query: (data) => ({ url: "/orders", method: "POST", body: data }),
      transformResponse: (res: { message: string; orders: Order[] }) => ({
        ...res,
        orders: res.orders.map(normalizeOrder),
      }),
      invalidatesTags: ["Order"],
    }),
    getMyOrders: builder.query<PaginatedOrders, { status?: string; limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/orders/mine", params: params ?? {} }),
      transformResponse: (res: PaginatedOrders) => ({
        ...res,
        data: res.data?.map(normalizeOrder) ?? [],
      }),
      serializeQueryArgs: paginatedSerializeQueryArgs("getMyOrders"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Order"],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: normalizeOrder,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
    getStoreOrders: builder.query<PaginatedOrders, { status?: string; limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/orders/store", params: params ?? {} }),
      transformResponse: (res: PaginatedOrders) => ({
        ...res,
        data: res.data?.map(normalizeOrder) ?? [],
      }),
      serializeQueryArgs: paginatedSerializeQueryArgs("getStoreOrders"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Order"],
    }),
    // Admin: every order across all stores
    getAdminOrders: builder.query<
      PaginatedOrders,
      { status?: string; search?: string; store_id?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: "/admin/orders", params: params ?? {} }),
      transformResponse: (res: PaginatedOrders) => ({
        ...res,
        data: res.data?.map(normalizeOrder) ?? [],
      }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: normalizeOrder,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id: id as string }, "Order"],
    }),
    cancelOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "PATCH" }),
      transformResponse: normalizeOrder,
      invalidatesTags: (_r, _e, id) => [{ type: "Order", id: id as string }, "Order"],
    }),
  }),
})

export const {
  useCheckoutMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetStoreOrdersQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = orderApi
