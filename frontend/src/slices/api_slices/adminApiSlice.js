import { apiSlice } from './apiSlice';

const ADMIN_URL = '/admin';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (data) => ({
        url: '/admin/auth',
        method: 'POST',
        body: data,
      }),
    }),
    adminLogout: builder.mutation({
      query: () => ({
        url: '/admin/logout',
        method: 'POST',
      }),
    }),
    adminRegister: builder.mutation({
      query: (data) => ({
        url: '/admin/signup',
        method: 'POST',
        body: data,
      }),
    }),
    adminUpdateUser: builder.mutation({
      query: (data) => ({
        url: '/admin/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    adminVerifyEmailOtp: builder.mutation({
      query: (data) => ({
        url: '/admin/verify-email-otp',
        method: 'POST',
        body: data,
      }),
    }),
    adminResendEmailOtp: builder.mutation({
      query: (data) => ({
        url: '/admin/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    getAllUsersForAdmin: builder.query({
      query: ({searchBy, sortBy, filterBy, page = 1, limit = 10}) =>({ 
        url: `${ADMIN_URL}/users/all`,
        method: 'GET',
        params:{searchBy, sortBy, filterBy, page, limit}
      }),
    }),
    blockUserFromAdmin: builder.mutation({
      query: ({userId}) => ({
        url: `${ADMIN_URL}/users/block`,
        method: 'POST',
        body: {userId},
      }),
    }),
    unblockUserFromAdmin: builder.mutation({
      query: ({userId}) => ({
        url: `${ADMIN_URL}/users/unblock`,
        method: 'POST',
        body: {userId},
      }),
    }),
    getAllQueriesForAdmin: builder.query({
      query: ({ sortBy, filterBy, page = 1, limit = 10}) =>({ 
        url: `${ADMIN_URL}/queries/all`,
        method: 'GET',
        params:{ sortBy, filterBy, page, limit}
      }),
    }),
    blockQueryFromAdmin: builder.mutation({
      query: ({queryId}) => ({
        url: `${ADMIN_URL}/queries/block`,
        method: 'POST',
        body: {queryId},
      }),
    }),
    unblockQueryFromAdmin: builder.mutation({
      query: ({queryId}) => ({
        url: `${ADMIN_URL}/queries/unblock`,
        method: 'POST',
        body: {queryId},
      }),
    }),
    deleteQueryFromAdmin: builder.mutation({
      query: ({queryId}) => ({
        url: `${ADMIN_URL}/queries/delete`,
        method: 'DELETE',
        body: {queryId},
      }),
    }),
    getQueryFromAdmin: builder.query({
      query: ({queryId}) =>({ 
        url: `${ADMIN_URL}/queries/`,
        method: 'GET',
        params:{ queryId}
      }),
    }),
    getAllReportsForSingleQueryFromAdmin: builder.query({
      query: ({queryId, page = 1, limit = 10}) =>({ 
        url: `${ADMIN_URL}/queries/reports/all`,
        method: 'GET',
        params:{ queryId,pageNum : page, limitNum : limit}
      }),
    }),
    deleteReportPostFromAdmin: builder.mutation({
      query: ({reportId}) => ({
        url: `${ADMIN_URL}/posts/report/delete`,
        method: 'DELETE',
        body: {reportPost_Id : reportId},
      }),
    }),
    getAllReportsForAllQueryFromAdmin: builder.query({
      query: ({ page = 1, limit = 10}) =>({ 
        url: `${ADMIN_URL}/queries/all/reports/all`,
        method: 'GET',
        params:{pageNum : page, limitNum : limit}
      }),
    }),
    getAllPerspectivesForAdmin: builder.query({
      query: ({ sortBy, filterBy, page = 1, limit = 10}) =>({ 
        url: `${ADMIN_URL}/perspectives/all`,
        method: 'GET',
        params: { sortBy, filterBy, page, limit }
      }),
    }),
    blockPerspectiveFromAdmin: builder.mutation({
      query: ({ perspectiveId }) => ({
        url: `${ADMIN_URL}/perspectives/block`,
        method: 'POST',
        body: { perspectiveId },
      }),
    }),
    unblockPerspectiveFromAdmin: builder.mutation({
      query: ({ perspectiveId }) => ({
        url: `${ADMIN_URL}/perspectives/unblock`,
        method: 'POST',
        body: { perspectiveId },
      }),
    }),
    deletePerspectiveFromAdmin: builder.mutation({
      query: ({ perspectiveId }) => ({
        url: `${ADMIN_URL}/perspectives/delete`,
        method: 'DELETE',
        body: { perspectiveId },
      }),
    }),
    getPerspectiveFromAdmin: builder.query({
      query: ({ perspectiveId }) => ({ 
        url: `${ADMIN_URL}/perspectives/`,
        method: 'GET',
        params: { perspectiveId }
      }),
    }),
    getAllReportsForSinglePerspectiveFromAdmin: builder.query({
      query: ({ perspectiveId, page = 1, limit = 10 }) => ({ 
        url: `${ADMIN_URL}/perspectives/reports/all`,
        method: 'GET',
        params: { perspectiveId, pageNum: page, limitNum: limit }
      }),
    }),
    getAllReportsForAllPerspectivesFromAdmin: builder.query({
      query: ({ page = 1, limit = 10 }) => ({ 
        url: `${ADMIN_URL}/perspectives/all/reports/all`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit }
      }),
    }),
    getAllBlockedQueryComments: builder.query({
      query: ({ page = 1, limit = 10 }) => ({ 
        url: `${ADMIN_URL}/comments/query/blocked`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit }
      }),
    }),
    unblockQueryCommentFromAdmin : builder.mutation({
      query: ({ comment_Id }) => ({
        url: `${ADMIN_URL}/comments/query/unblock`,
        method: 'POST',
        body: { queryComment_Id : comment_Id },
      }),
    }),
    deleteQueryCommentFromAdmin : builder.mutation({
      query: ({ comment_Id }) => ({
        url: `${ADMIN_URL}/comments/query/delete`,
        method: 'DELETE',
        body: { queryComment_Id : comment_Id },
      }),
    }),


    getAllBlockedPerspectiveComments: builder.query({
      query: ({ page = 1, limit = 10 }) => ({ 
        url: `${ADMIN_URL}/comments/perspective/blocked`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit }
      }),
    }),
    unblockPerspectiveCommentFromAdmin : builder.mutation({
      query: ({ comment_Id }) => ({
        url: `${ADMIN_URL}/comments/perspective/unblock`,
        method: 'POST',
        body: { perspectiveComment_Id : comment_Id },
      }),
    }),
    deletePerspectiveCommentFromAdmin : builder.mutation({
      query: ({ comment_Id }) => ({
        url: `${ADMIN_URL}/comments/perspective/delete`,
        method: 'DELETE',
        body: { perspectiveComment_Id : comment_Id },
      }),
    }),
    getAllReportsForSingleCommentFromAdmin : builder.query({
      query: ({ page = 1, limit = 10, commentId }) => ({ 
        url: `${ADMIN_URL}/comments/reports/single`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit, commentId }
      }),
    }),
    deleteReportOnComment: builder.mutation({
      query: ({ reportComment_Id }) => ({
        url: `${ADMIN_URL}/comments/reports/single/delete`,
        method: 'DELETE',
        body: { reportComment_Id },
      }),
    }),

    //for answer management

    getAllBlockedAnswersFromAdmin: builder.query({
      query: ({ page = 1, limit = 10 }) => ({ 
        url: `${ADMIN_URL}/answers/blocked`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit }
      }),
    }),
    unblockAnswerFromAdmin : builder.mutation({
      query: ({ answer_Id }) => ({
        url: `${ADMIN_URL}/answers/unblock`,
        method: 'POST',
        body: { answer_Id : answer_Id },
      }),
    }),
    deleteAnswerFromAdmin : builder.mutation({
      query: ({ answer_Id }) => ({
        url: `${ADMIN_URL}/answers/delete`,
        method: 'DELETE',
        body: { answer_Id : answer_Id },
      }),
    }),

    getAllReportsForSingleAnswerFromAdmin : builder.query({
      query: ({ page = 1, limit = 10, answerId }) => ({ 
        url: `${ADMIN_URL}/answers/single/reports`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit, answerId }
      }),
    }),
    deleteReportOnAnswerFromAdmin: builder.mutation({
      query: ({ reportAnswerId }) => ({
        url: `${ADMIN_URL}/answers/reports/delete`,
        method: 'DELETE',
        body: { reportAnswerId },
      }),
    }),

    //topics management 

    createTopicFromAdmin : builder.mutation({
      query: ({ name, description }) => ({
        url: `${ADMIN_URL}/topic/craete`,
        method: 'POST',
        body: { name, description },
      }),
    }),
    getAllTopicsForAdmin : builder.query({
      query: ({ page = 1, limit = 10, sortBy='default' }) => ({ 
        url: `${ADMIN_URL}/topic/all`,
        method: 'GET',
        params: { pageNum: page, limitNum: limit, sortBy }
      }),
    }),

  }),
});

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  useAdminRegisterMutation,
  useAdminVerifyEmailOtpMutation,
  useAdminResendEmailOtpMutation,
  useAdminUpdateUserMutation,
  useGetAllUsersForAdminQuery,
  useBlockUserFromAdminMutation,
  useUnblockUserFromAdminMutation,
  useGetAllQueriesForAdminQuery,
  useBlockQueryFromAdminMutation,
  useUnblockQueryFromAdminMutation,
  useDeleteQueryFromAdminMutation,
  useGetQueryFromAdminQuery,
  useGetAllReportsForSingleQueryFromAdminQuery,
  useDeleteReportPostFromAdminMutation,
  useGetAllReportsForAllQueryFromAdminQuery,
  useGetAllPerspectivesForAdminQuery,
  useBlockPerspectiveFromAdminMutation,
  useUnblockPerspectiveFromAdminMutation,
  useDeletePerspectiveFromAdminMutation,
  useGetPerspectiveFromAdminQuery,
  useGetAllReportsForSinglePerspectiveFromAdminQuery,
  useGetAllReportsForAllPerspectivesFromAdminQuery,
  useGetAllBlockedQueryCommentsQuery,
  useUnblockQueryCommentFromAdminMutation,
  useDeleteQueryCommentFromAdminMutation,
  useGetAllReportsForSingleCommentFromAdminQuery,
  useDeleteReportOnCommentMutation,
  useGetAllBlockedPerspectiveCommentsQuery,
  useUnblockPerspectiveCommentFromAdminMutation,
  useDeletePerspectiveCommentFromAdminMutation,
  useGetAllBlockedAnswersFromAdminQuery,
  useUnblockAnswerFromAdminMutation,
  useDeleteAnswerFromAdminMutation,
  useGetAllReportsForSingleAnswerFromAdminQuery,
  useDeleteReportOnAnswerFromAdminMutation,
  useCreateTopicFromAdminMutation,
  useGetAllTopicsForAdminQuery,
  

} = adminApiSlice;