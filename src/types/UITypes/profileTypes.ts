import type { Conversation } from "../apiTypes/ConversationTypes";

export type ModelItemProps = {
    model: Conversation
    isDownloading: boolean
    onOpen: (model: Conversation) => void
    onDownload: (model: Conversation) => void
    onDelete: (model: Conversation) => void
}
