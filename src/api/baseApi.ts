import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tokenStorage } from "../store/tokenStore";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://zapusk.io/api";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,

    prepareHeaders: async (headers) => {
      const token = await tokenStorage.getToken();

      headers.set("X-User-Id", token);

      return headers;
    },
  }),

  tagTypes: ["Conversations", "Messages", "Jobs", "Cad", "Fem", "Ideas"],

  endpoints: () => ({}),
});
