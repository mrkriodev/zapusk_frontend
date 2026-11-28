import { baseApi } from '../baseApi';
import type { RagAskRequest, RagAskResponse } from '../../types/apiTypes/RagTypes';

/** Ожидание ответа RAG: генерация с поиском по базе может занимать до двух минут */
export const RAG_TIMEOUT_MS = 120_000;

export const ragApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    askRag: builder.mutation<RagAskResponse, RagAskRequest>({
      query: ({ query, domain }) => ({
        url: '/rag/ask',
        method: 'POST',
        body: domain && domain !== 'all' ? { query, domain } : { query },
        timeout: RAG_TIMEOUT_MS,
      }),
    }),
  }),
});

export const { useAskRagMutation } = ragApi;
