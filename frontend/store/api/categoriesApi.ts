import { baseApi } from "./baseApi"

export interface GlobalCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface PaginatedCategories {
  data: GlobalCategory[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<PaginatedCategories, void>({
      query: () => "/categories",
    }),
    getCategoryBySlug: builder.query<GlobalCategory, string>({
      query: (slug) => `/categories/${slug}`,
    }),
  }),
})

export const { useGetCategoriesQuery, useGetCategoryBySlugQuery } = categoriesApi
