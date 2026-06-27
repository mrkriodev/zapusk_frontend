import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tokenStorage } from "../store/tokenStore";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    
    baseUrl: import.meta.env.VITE_API_URL,
    
    prepareHeaders: async (headers) => {
      const token = await tokenStorage.getToken();

      headers.set("X-User-Id", token);

      return headers;
    },

  }),

  tagTypes: ["Conversations", "Messages", "Jobs", "Cad"],

  endpoints: () => ({}),
});