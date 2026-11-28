import { API_BASE_URL, baseApi } from '../baseApi';
import { tokenStorage } from '../../store/tokenStore';
import type { FemCancel, FemJobAccepted, FemRun } from '../../types/apiTypes/FemTypes';
import type { Capabilities } from '../../types/apiTypes/CapabilityTypes';
import type { DownloadCadFileResult } from '../../types/apiTypes/CadTypes';
import { t } from "../../i18n/i18n";

export const isFemPending = (status: string) => status === 'queued' || status === 'running';

export const femApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCapabilities: builder.query<Capabilities, void>({
      query: () => '/capabilities',
    }),
    getFemRuns: builder.query<{ items: FemRun[] }, string>({
      query: (id) => `/conversations/${id}/fem`,
      providesTags: (_result, _error, id) => [{ type: 'Fem', id }],
    }),
    getFemRun: builder.query<FemRun, string>({
      query: (id) => `/fem/runs/${id}`,
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const previous = femApi.endpoints.getFemRun.select(id)(getState()).data;
        try {
          const { data } = await queryFulfilled;
          dispatch(femApi.util.updateQueryData('getFemRuns', data.conversation_id, (draft) => {
            const index = draft.items.findIndex((run) => run.id === data.id);
            if (index < 0) draft.items.unshift(data);
            else draft.items[index] = data;
          }));
          const finished = !isFemPending(data.status) && previous?.status !== data.status;
          const rebuilt = data.pre_fem && previous?.version !== data.version;
          if (finished || rebuilt) {
            dispatch(baseApi.util.invalidateTags([
              { type: 'Conversations', id: data.conversation_id },
              { type: 'Cad', id: data.conversation_id },
            ]));
          }
        } catch {
          return;
        }
      },
    }),
    startFem: builder.mutation<FemJobAccepted, { conversationId: string; version: number }>({
      query: ({ conversationId, version }) => ({
        url: `/conversations/${conversationId}/cad/${version}/fem`, method: 'POST', body: {},
      }),
      async onQueryStarted({ conversationId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(femApi.util.updateQueryData('getFemRuns', conversationId, (draft) => {
            if (!draft.items.some((run) => run.id === data.fem_run_id)) {
              draft.items.unshift({
                id: data.fem_run_id, conversation_id: conversationId, version: data.version,
                run_id: '', status: 'queued', created_at: new Date().toISOString(),
              });
            }
          }));
        } catch {
          dispatch(baseApi.util.invalidateTags([{ type: 'Fem', id: conversationId }]));
        }
      },
    }),
    cancelFem: builder.mutation<FemCancel, { id: string; conversationId: string }>({
      query: ({ id }) => ({ url: `/fem/runs/${id}/cancel`, method: 'POST' }),
    }),

  }),
});

export const {
  useGetCapabilitiesQuery, useGetFemRunsQuery, useGetFemRunQuery,
  useStartFemMutation, useCancelFemMutation,
} = femApi;

export async function downloadFemArtifact(id: string, format: string): Promise<DownloadCadFileResult> {
  const userId = await tokenStorage.getToken();
  const query = new URLSearchParams({ format });
  const response = await fetch(`${API_BASE_URL}/fem/runs/${encodeURIComponent(id)}/download?${query}`, {
    headers: { 'X-User-Id': userId },
  });
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const detail = data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string' ? data.detail : t('Не удалось скачать файл расчёта.');
    throw new Error(detail);
  }
  const match = response.headers.get('content-disposition')?.match(/filename\*?=(?:UTF-8''|")?([^;"]+)/i);
  return { blob: await response.blob(), fileName: match?.[1] ? decodeURIComponent(match[1]) : undefined };
}
