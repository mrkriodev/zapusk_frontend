import type {
  CadVersionsResponse,
  DownloadCadFileArgs,
  DownloadCadFileResult,
  JsonObject,
  ReviseCadArgs,
} from "../../types/apiTypes/CadTypes";
import type { JobAccepted } from "../../types/apiTypes/JobTypes";
import { baseApi } from "../baseApi";

export const cadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCadVersions: builder.query<CadVersionsResponse, string>({
      query: (conversationId) => `/conversations/${conversationId}/cad`,
      providesTags: (_result, _error, conversationId) => [
        { type: "Cad", id: conversationId },
      ],
    }),

    downloadCadFile: builder.query<DownloadCadFileResult, DownloadCadFileArgs>({
      query: ({ conversationId, version, format }: DownloadCadFileArgs) => ({
        url: `/conversations/${conversationId}/cad/${version}/download`,
        params: {
          format,
        },
        responseHandler: async (response) => {
          const disposition = response.headers.get("content-disposition");
          const fileNameMatch = disposition?.match(/filename\*?=(?:UTF-8''|")?([^;"]+)/i);
          return {
            blob: await response.blob(),
            fileName: fileNameMatch?.[1] ? decodeURIComponent(fileNameMatch[1]) : undefined,
          };
        },
      }),
    }),

    getCadModelParams: builder.query<JsonObject, Omit<DownloadCadFileArgs, "format">>({
      query: ({ conversationId, version }) => ({
        url: `/conversations/${conversationId}/cad/${version}/download`,
        params: { format: "model_params" },
      }),
    }),

    reviseCad: builder.mutation<JobAccepted, ReviseCadArgs>({
      query: ({ conversationId, version, modelParams }) => ({
        url: `/conversations/${conversationId}/cad/${version}/revise`,
        method: "POST",
        body: { model_params: modelParams },
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "Conversations", id: args.conversationId },
        { type: "Messages", id: args.conversationId },
        { type: "Cad", id: args.conversationId },
        { type: "Jobs", id: args.conversationId },
      ],
    }),

    reviseCadByModelParams: builder.mutation<JobAccepted, JsonObject>({
      query: (modelParams) => ({
        url: "/cad/revise",
        method: "POST",
        body: { model_params: modelParams },
      }),
    }),
  }),
  
});

export const { 
    useGetCadVersionsQuery, 
    useLazyDownloadCadFileQuery,
    useLazyGetCadModelParamsQuery,
    useReviseCadMutation,
    useReviseCadByModelParamsMutation,
} = cadApi;
