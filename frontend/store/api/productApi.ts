import { baseApi } from "./baseApi"
import {
  numerify,
  numerifyPaginated,
  PRODUCT_NUM_FIELDS,
  paginatedSerializeQueryArgs,
  paginatedMerge,
  paginatedForceRefetch,
} from "./_normalize"

export type Customization =
  | {
      type: "text"
      label: string
      help?: string
      required?: boolean
      max_length?: number
      placeholder?: string
    }
  | {
      type: "select"
      label: string
      help?: string
      required?: boolean
      options: string[]
    }

export interface Product {
  id: string
  store_id: string
  store_category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  stock: number
  sku: string | null
  images: { url: string; alt?: string }[]
  features: { label: string; value?: string }[]
  colors: { name: string; hex: string; image_url?: string }[]
  customizations: Customization[]
  status: "active" | "draft" | "out_of_stock"
  is_featured: boolean
  rating: number
  review_count: number
  sales_count: number
  store?: { id: string; name: string; slug: string }
  category?: { id: string; name: string; slug?: string }
}

export interface PaginatedProducts {
  data: Product[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      PaginatedProducts,
      { search?: string; category?: string; store_id?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: "/products", params: params ?? {} }),
      transformResponse: (res: PaginatedProducts) => numerifyPaginated(res, PRODUCT_NUM_FIELDS),
      serializeQueryArgs: paginatedSerializeQueryArgs("getProducts"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Product"],
    }),
    getMyProducts: builder.query<
      PaginatedProducts,
      { status?: string; category_id?: string; search?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => ({ url: "/products/mine", params: params ?? {} }),
      transformResponse: (res: PaginatedProducts) => numerifyPaginated(res, PRODUCT_NUM_FIELDS),
      serializeQueryArgs: paginatedSerializeQueryArgs("getMyProducts"),
      merge: paginatedMerge,
      forceRefetch: paginatedForceRefetch,
      providesTags: ["Product"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (res: Product) => numerify(res, PRODUCT_NUM_FIELDS),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (data) => ({ url: "/products", method: "POST", body: data }),
      transformResponse: (res: Product) => numerify(res, PRODUCT_NUM_FIELDS),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<Product, { id: string } & Partial<Product>>({
      query: ({ id, ...data }) => ({ url: `/products/${id}`, method: "PATCH", body: data }),
      transformResponse: (res: Product) => numerify(res, PRODUCT_NUM_FIELDS),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }, "Product"],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    uploadProductImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({ url: "/products/upload-image", method: "POST", body: formData }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetMyProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = productApi
