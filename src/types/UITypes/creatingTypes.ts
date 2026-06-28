type PartType = "case" | "holder" | "adapter" | "mount" | "decor" | "other" | ""

type Material = "PLA" | "PETG" | "ABS" | "TPU" | "Resin" | "unknown" | ""

type StrengthLevel = "light" | "normal" | "strong" | "max" | ""

type Supports = "allowed" | "avoid" | "none" | ""

type EdgeStyle = "sharp" | "rounded" | "chamfer" | ""

export type StlParamsForm = {
  partType: PartType
  purpose: string

  lengthMm: string
  widthMm: string
  heightMm: string
  wallThicknessMm: string

  material: Material
  strengthLevel: StrengthLevel
  supports: Supports
  edgeStyle: EdgeStyle

  extraPrompt: string
}

export type Message = {
  id: number
  text: string
  isUser: boolean
  hasFile?: boolean
}

export type Chat = {
    id: string;
    user_id: string;
    title: string | null;
    current_version: number | null;
    message_count: number;
    created_at: string;
    updated_at: string;
}

export type ChatItemProps = {
    item: Chat
    activeChat: string | null
    setActiveChat: (e: string) => void
    onDeleteClick: () => void
}

// modal props

export type DeleteModalProps = {
  chat: Chat | null
  onCancel: () => void
  onConfirm: () => void
}

export type CreateModalProps = {
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}
