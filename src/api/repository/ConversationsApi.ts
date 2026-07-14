import type { PaginationParams } from "../../types/apiTypes/ApiTypes";
import type {
    AssistantChatOut,
    Conversation,
    ConversationDetail,
    ConversationsResponse,
    CreateConversationRequest
} from "../../types/apiTypes/ConversationTypes";
import type { GenerateRequest, JobAccepted } from "../../types/apiTypes/JobTypes";
import type { AssistantChatRequest, SendMessageArgs } from "../../types/apiTypes/MessageTypes";
import { baseApi } from "../baseApi";

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

        chatWithAssistant: builder.mutation<
            AssistantChatOut,
            { conversationId: string } & AssistantChatRequest
        >({
            query: ({ conversationId, ...body }) => ({
                url: `/conversations/${conversationId}/assistant`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, args) => [
                { type: "Conversations", id: args.conversationId },
                { type: "Messages", id: args.conversationId },
                { type: "Cad", id: args.conversationId },
            ]
        }),

        generateConversation: builder.mutation<
            JobAccepted,
            { conversationId: string } & GenerateRequest
        >({
            query: ({ conversationId, ...body }) => ({
                url: `/conversations/${conversationId}/generate`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, args) => [
                { type: "Conversations", id: args.conversationId },
                { type: "Messages", id: args.conversationId },
                { type: "Jobs", id: args.conversationId },
                { type: "Cad", id: args.conversationId },
            ]
        })
    })
})

export const {
    useGetConversationsQuery,
    useGetConservationByIdQuery,
    useCreateConversationMutation,
    useDeleteConversationMutation,
    useSendMessageMutation,
    useChatWithAssistantMutation,
    useGenerateConversationMutation
} = conversationApi
