import type { CadVersionsResponse, DownloadCadFileArgs } from "../../types/apiTypes/CadTypes";
import { baseApi } from "../baseApi";

export const cadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCadVersions: builder.query<CadVersionsResponse, string>({
      query: (conversationId) => `/conversations/${conversationId}/cad`,
      providesTags: (_result, _error, conversationId) => [
        { type: "Cad", id: conversationId },
      ],
    }),

    downloadCadFile: builder.query<Blob, DownloadCadFileArgs>({
      query: ({ conversationId, version, format }: { conversationId: string; version: number; format: "stl" | "step";}) => ({
        url: `/conversations/${conversationId}/cad/${version}/download`,
        params: {
          format,
        },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const { 
    useGetCadVersionsQuery, 
    useLazyDownloadCadFileQuery 
} = cadApi;