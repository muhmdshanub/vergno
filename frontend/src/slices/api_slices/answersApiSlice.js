import { apiSlice } from './apiSlice';

const ANSWER_URL = '/users/answers';

export const answerApiSlice = apiSlice.injectEndpoints({

    endpoints: (builder) => ({
        createAnswer: builder.mutation({
            query: ({ answer_content, parent_query_id }) => ({
              url: `${ANSWER_URL}/add`,
              method: 'POST',
              body: { answer_content, parent_query_id },
            }),
          }),
          getAllAnswersForQuery: builder.query({
            query: ({query_id, page=1, limit=10}) => ({
              url: `${ANSWER_URL}/all`,
              method: 'GET',
              params: { query_id, page, limit },
            }),
          }),
          reportAnswer: builder.mutation({
            query: ({ reason, answer_source, answer_id }) => ({
              url: `${ANSWER_URL}/report`,
              method: 'POST',
              body: { reason, answer_source, answer_id },
            }),
          }),
          deleteAnswer: builder.mutation({
            query: ({  answer_id }) => ({
              url: `${ANSWER_URL}/delete`,
              method: 'DELETE',
              body: { answer_id },
            }),
          }),

    })
})

export const {
    useCreateAnswerMutation,
    useGetAllAnswersForQueryQuery,
    useReportAnswerMutation,
    useDeleteAnswerMutation,



} = answerApiSlice