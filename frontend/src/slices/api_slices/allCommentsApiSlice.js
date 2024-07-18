import { apiSlice } from './apiSlice';

const ALL_COMMENTS_URL = '/users/comments';

export const allCommentsApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({
        queryComment: builder.mutation({
            query: ({ comment_content, parent_query_id }) => ({
              url: `${ALL_COMMENTS_URL}/query`,
              method: 'POST',
              body: { comment_content, parent_query_id },
            }),
          }),
          queryReply: builder.mutation({
            query: ({ comment_content, parent_query_id, parent_comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/reply/query`,
              method: 'POST',
              body: { comment_content, parent_query_id , parent_comment_id},
            }),
          }),

          perspectiveComment: builder.mutation({
            query: ({ comment_content, parent_perspective_id }) => ({
              url: `${ALL_COMMENTS_URL}/perspective`,
              method: 'POST',
              body: { comment_content, parent_perspective_id },
            }),
          }),
          perspectiveReply: builder.mutation({
            query: ({ comment_content, parent_perspective_id, parent_comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/reply/perspective`,
              method: 'POST',
              body: { comment_content, parent_perspective_id , parent_comment_id},
            }),
          }),
          getAllCommentsForQuery: builder.query({
            query: ({query_id, page=1, limit=10}) => ({
              url: `${ALL_COMMENTS_URL}/all/query`,
              method: 'GET',
              params: { query_id, page, limit },
            }),
          }),
          getAllCommentsForPerspective: builder.query({
            query: ({perspective_id, page=1, limit=10}) => ({
              url: `${ALL_COMMENTS_URL}/all/perspective`,
              method: 'GET',
              params: { perspective_id, page, limit },
            }),
          }),
          likeQueryComment:builder.mutation({
            query: ({ comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/query/like`,
              method: 'POST',
              body: { queryCommentId : comment_id},
            }),
          }),
          unlikeQueryComment:builder.mutation({
            query: ({ comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/query/unlike`,
              method: 'DELETE',
              body: { queryCommentId : comment_id},
            }),
          }),
          likePerspectiveComment:builder.mutation({
            query: ({ comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/perspective/like`,
              method: 'POST',
              body: { perspectiveCommentId : comment_id},
            }),
          }),
          unlikePerspectiveComment:builder.mutation({
            query: ({ comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/perspective/unlike`,
              method: 'DELETE',
              body: { perspectiveCommentId : comment_id},
            }),
          }),
          reportComment: builder.mutation({
            query: ({ reason, comment_type, comment_source, comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/report`,
              method: 'POST',
              body: { reason, comment_type, comment_source, comment_id },
            }),
          }),
          getAllCRepliesForQueryComment: builder.query({
            query: ({query_comment_id, page=1, limit=10}) => ({
              url: `${ALL_COMMENTS_URL}/reply/all/query`,
              method: 'GET',
              params: { query_comment_id, page, limit },
            }),
          }),
          getAllCRepliesForPerspectiveComment: builder.query({
            query: ({perspective_comment_id, page=1, limit=10}) => ({
              url: `${ALL_COMMENTS_URL}/reply/all/perspective`,
              method: 'GET',
              params: { perspective_comment_id, page, limit },
            }),
          }),
          deleteQueryComment : builder.mutation({
            query: ({comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/query/delete`,
              method: 'DELETE',
              body: { comment_id },
            }),
          }),
          deleteQueryReply : builder.mutation({
            query: ({reply_id }) => ({
              url: `${ALL_COMMENTS_URL}/reply/query/delete`,
              method: 'DELETE',
              body: { reply_id },
            }),
          }),
          deletePerspectiveComment : builder.mutation({
            query: ({comment_id }) => ({
              url: `${ALL_COMMENTS_URL}/perspective/delete`,
              method: 'DELETE',
              body: { comment_id },
            }),
          }),
          deletePerspectiveReply : builder.mutation({
            query: ({reply_id }) => ({
              url: `${ALL_COMMENTS_URL}/reply/perspective/delete`,
              method: 'DELETE',
              body: { reply_id },
            }),
          }),


    })

})


export const {
    useQueryCommentMutation,
    useQueryReplyMutation,
    usePerspectiveCommentMutation,
    usePerspectiveReplyMutation,
    useGetAllCommentsForQueryQuery,
    useGetAllCommentsForPerspectiveQuery,
    useLikeQueryCommentMutation,
    useUnlikeQueryCommentMutation,
    useLikePerspectiveCommentMutation,
    useUnlikePerspectiveCommentMutation,
    useReportCommentMutation,
    useGetAllCRepliesForPerspectiveCommentQuery,
    useGetAllCRepliesForQueryCommentQuery,
    useDeleteQueryCommentMutation,
    useDeleteQueryReplyMutation,
    useDeletePerspectiveCommentMutation,
    useDeletePerspectiveReplyMutation,


} = allCommentsApiSlice