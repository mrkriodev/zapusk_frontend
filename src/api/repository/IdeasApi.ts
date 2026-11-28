import { baseApi } from "../baseApi";
import type { Idea, IdeasResponse, SubmitIdeaArgs } from "../../types/apiTypes/IdeaTypes";

// POST /ideas — отправить идею, GET /ideas — идеи пользователя (ТЗ 12.7).
// В ТЗ указан префикс /v1; остальные ручки фронтенда работают без него, поэтому здесь так же.
export const ideasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyIdeas: builder.query<IdeasResponse, void>({
      query: () => ({ url: "/ideas", params: { limit: 100, offset: 0 } }),
      providesTags: ["Ideas"],
    }),

    submitIdea: builder.mutation<Idea, SubmitIdeaArgs>({
      query: ({ attachment, page_context, ...fields }) => {
        const body = new FormData();
        body.append("title", fields.title);
        body.append("description", fields.description);
        body.append("section", fields.section);
        body.append("type", fields.type);
        body.append("contact_allowed", String(fields.contact_allowed));
        if (page_context) body.append("page_context", JSON.stringify(page_context));
        if (attachment) body.append("attachment", attachment);
        return { url: "/ideas", method: "POST", body };
      },
      invalidatesTags: ["Ideas"],
    }),
  }),
});

export const { useGetMyIdeasQuery, useSubmitIdeaMutation } = ideasApi;
