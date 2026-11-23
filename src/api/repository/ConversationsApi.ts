import type { PaginationParams } from "../../types/apiTypes/ApiTypes";
import type {
    Conversation,
    ConversationDetail,
    ConversationsResponse,
    CreateConversationRequest
} from "../../types/apiTypes/ConversationTypes";
import type { JobAccepted } from "../../types/apiTypes/JobTypes";
import type {
    SendMessageArgs,
} from "../../types/apiTypes/MessageTypes";
import { baseApi } from "../baseApi";
import type { DialogChatArgs, DialogChatOut } from "../../types/apiTypes/DialogTypes";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const canRetryChat = (error: FetchBaseQueryError) =>
    error.status === 502 || error.status === 503 || error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR"
    || (error.status === "PARSING_ERROR" && (error.originalStatus === 502 || error.originalStatus === 503));

export const conversationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getConversations: builder.query<ConversationsResponse, PaginationParams | void>({
            query: (args) => {

                const {limit = 50, offset = 0} = args ?? {}

                return {
                    url: "/conversations",
                    params: {
                        limit,
                        offset
                    },
                }
            },
            providesTags: ["Conversations"]
        }),

        getConservationById: builder.query<ConversationDetail, string>({
            query: (conservationId) => `/conversations/${conservationId}`,
            providesTags: (_result, _error, conversationId) => [
                { type: "Conversations", id: conversationId },
                { type: "Messages", id: conversationId },
                { type: "Cad", id: conversationId },
            ]
        }),

        createConversation: builder.mutation<Conversation, CreateConversationRequest>({
            query: (body: {title: string | null}) => ({
                url: "/conversations",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Conversations"]
        }),

        deleteConversation: builder.mutation<void, string>({
            query: (conversationId: string ) => ({
                url: `/conversations/${conversationId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Conversations"]
        }),

        sendMessage: builder.mutation<JobAccepted, SendMessageArgs>({
            query: ({conversationId, text} : {conversationId: string, text: string}) => ({
                url: `/conversations/${conversationId}/messages`,
                method: "POST",
                body: { text }
            }),
            invalidatesTags: (_result, _error, args) => [
                { type: "Conversations", id: args.conversationId },
                { type: "Messages", id: args.conversationId },
                { type: "Jobs", id: args.conversationId },
            ]
        }),

        chat: builder.mutation<DialogChatOut, DialogChatArgs>({
            async queryFn({ conversationId, request, retryOnce = true }, _api, _extra, fetchWithBQ) {
                const args = {
                    url: `/conversations/${conversationId}/chat`,
                    method: "POST",
                    body: request,
                    timeout: 60_000,
                };
                let result = await fetchWithBQ(args);
                if (result.error && retryOnce && canRetryChat(result.error)) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    result = await fetchWithBQ(args);
                }
                if (result.error) return { error: result.error };
                return { data: result.data as DialogChatOut };
            },
            async onQueryStarted({ conversationId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(conversationApi.util.updateQueryData("getConservationById", conversationId, (draft) => {
                        const additions = [data.user_message, data.assistant_message];
                        for (const message of additions) {
                            const index = draft.messages.findIndex((item) => item.id === message.id);
                            if (index < 0) draft.messages.push(message);
                            else draft.messages[index] = message;
                        }
                        draft.dialog_state = { draft: data.draft, generation: data.generation };
                    }));
                } catch {
                    // Preserve a failed turn for an idempotent retry by the caller.
                }
            },
            invalidatesTags: (result, _error, args) => result ? [
                { type: "Conversations", id: args.conversationId },
                { type: "Messages", id: args.conversationId },
            ] : [],
        }),
    })
})

export const {
    useGetConversationsQuery,
    useGetConservationByIdQuery,
    useCreateConversationMutation,
    useDeleteConversationMutation,
    useSendMessageMutation,
    useChatMutation,
    useLazyGetConservationByIdQuery
} = conversationApi
