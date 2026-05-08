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
  id: number;
  name: string;
  date: string;
}

export type ChatItemProps = {
    item: Chat
    activeChat: number
    setActiveChat: (e: number) => void
}
