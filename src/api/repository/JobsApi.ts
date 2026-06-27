import type { Job } from "../../types/apiTypes/JobTypes";
import { baseApi } from "../baseApi";

export const JobsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getJobById: builder.query<Job, string>({
            query: (jobId) => ({
                url: `/jobs/${jobId}`
            }),
            providesTags: (_result, _error, jobId) => [{type: "Jobs", id: jobId}]
        })
    })
})

export const { useGetJobByIdQuery } = JobsApi