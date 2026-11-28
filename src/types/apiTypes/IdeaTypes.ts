// Сервис идей «Лампочка» (ТЗ v6.39, раздел 12.7)

export type IdeaSection = "home" | "core" | "lab" | "mplace" | "fab" | "studio" | "cabinet";
export type IdeaType = "feature" | "improvement" | "product_class" | "knowledge_source" | "other";
export type IdeaStatus = "submitted" | "in_review" | "planned" | "done" | "rejected" | "merged";

export type Idea = {
  id: string;
  /** Номер идеи для пользователя, если сервер его присваивает */
  number?: number | string | null;
  title: string;
  description?: string;
  section: IdeaSection;
  type: IdeaType;
  status: IdeaStatus;
  /** Ответ платформы */
  reply?: string | null;
  submitted_by_agent?: boolean;
  created_at: string;
  updated_at?: string;
};

export type IdeasResponse = { items: Idea[]; total: number };

export type SubmitIdeaArgs = {
  title: string;
  description: string;
  section: IdeaSection;
  type: IdeaType;
  contact_allowed: boolean;
  page_context?: { url: string; user_agent: string; ui_version: string } | null;
  attachment?: File | null;
};
