import type { PaginationParams } from "../../types/apiTypes/ApiTypes";
import type { Conversation, ConversationDetail, ConversationsResponse, CreateConversationRequest } from "../../types/apiTypes/ConversationTypes";
import type { JobAccepted } from "../../types/apiTypes/JobTypes";
import type { SendMessageArgs } from "../../types/apiTypes/MessageTypes";
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
                url: `/conversations/${conversationId}`,
                method: "POST",
                body: { text }
            }),
            invalidatesTags: (_result, _error, args) => [
                { type: "Conversations", id: args.conversationId },
                { type: "Messages", id: args.conversationId },
                { type: "Jobs", id: args.conversationId },
            ]
        })
    })
})

export const {
    useGetConversationsQuery,
    useGetConservationByIdQuery,
    useCreateConversationMutation,
    useDeleteConversationMutation,
    useSendMessageMutation
} = conversationApi