import { baseApi } from "./baseApi"

export interface Address {
  id: string
  user_id: string
  label: string | null
  recipient_name: string
  phone: string
  address_line: string
  city: string | null
  country: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface AddressInput {
  label?: string | null
  recipient_name: string
  phone: string
  address_line: string
  city?: string | null
  country?: string | null
  is_default?: boolean
}

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAddresses: builder.query<{ data: Address[] }, void>({
      query: () => "/users/me/addresses",
      providesTags: ["Address"],
    }),
    createMyAddress: builder.mutation<Address, AddressInput>({
      query: (body) => ({ url: "/users/me/addresses", method: "POST", body }),
      invalidatesTags: ["Address"],
    }),
    updateMyAddress: builder.mutation<Address, { id: string } & Partial<AddressInput>>({
      query: ({ id, ...body }) => ({ url: `/users/me/addresses/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Address"],
    }),
    deleteMyAddress: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Address"],
    }),
  }),
})

export const {
  useGetMyAddressesQuery,
  useCreateMyAddressMutation,
  useUpdateMyAddressMutation,
  useDeleteMyAddressMutation,
} = addressApi
