import { apiSlice } from './apiSlice';

const USERS_URL = '/users';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/users/auth',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/users/signup',
        method: 'POST',
        body: data,
      }),
    }),
    verifyirebaseAuthentication: builder.mutation({
      query: (data) =>({
        url: '/users/firebase-auth-verify',
        method: 'POST',
        body : data,
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    verifyEmailOtp: builder.mutation({
      query: (data) => ({
        url: '/users/verify-email-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resendEmailOtp: builder.mutation({
      query: (data) => ({
        url: '/users/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/users/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),
    verifyForgotPasswordOtp: builder.mutation({
      query: (data) => ({
        url: `/users/verify-forgot-password-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/users/reset-password`,
        method: 'POST',
        body: data,
      }),
    }),

    toggleDiscoverEnable: builder.mutation({
      query: ({isDiscoverEnabled}) => ({
        url: `/users/discover/enable-toggle`,
        method: 'POST',
        body: {isDiscoverEnabled},
      }),
    }),

    getIsDiscoverEnabled: builder.query({
      query: () => ({
        url: `/users/discover/enable-toggle`,
        method: 'GET',
      }),
    }),
    discoverSimilarTopicFollowings: builder.query({
      query: () => ({
        url: `/users/discover/similar-users`,
        method: 'GET',
      }),
    }),
    getAllThemes: builder.query({
      query: () => ({
        url: `/users/themes`,
        method: 'GET',
      }),
    }),
    updateThemes: builder.mutation({
      query: ({themeId}) => ({
        url: `/users/themes`,
        method: 'POST',
        body: {themeId},
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
  useUpdateUserMutation,
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useVerifyirebaseAuthenticationMutation,
  useToggleDiscoverEnableMutation,
  useGetIsDiscoverEnabledQuery,
  useLazyDiscoverSimilarTopicFollowingsQuery,
  useGetAllThemesQuery,
  useUpdateThemesMutation,

} = userApiSlice;