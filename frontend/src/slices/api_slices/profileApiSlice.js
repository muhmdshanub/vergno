import { apiSlice } from './apiSlice';

const PROFILE_URL = '/users/profile';

export const profileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getUserProfileCardInfo: builder.query({
        query: () => ({
          url: `${PROFILE_URL}/info`,
          method: 'GET',
        }),
      }),
    updateProfilePhoto: builder.mutation({
        query: (data) => ({
          url: `${PROFILE_URL}/profile-photo/update`,
          method: 'POST',
          body: data,
        }),
      }),
      updateProfileName: builder.mutation({
        query: ({newName}) => ({
          url: `${PROFILE_URL}/name/update`,
          method: 'POST',
          body: {newName},
        }),
      }),
      getAllQueriesForUserProfile : builder.query({
        query: ({pageNum=1, limitNum=10}) => ({
            url: `${PROFILE_URL}/queries/all`,
            method: 'GET',
            params:{pageNum, limitNum}
          }),
      }),
      getAllPerspectivesForUserProfile : builder.query({
        query: ({pageNum=1, limitNum=10}) => ({
            url: `${PROFILE_URL}/perspectives/all`,
            method: 'GET',
            params:{pageNum, limitNum}
          }),
      }),
      getUserAboutInfoForProfile : builder.query({
        query: () => ({
          url: `${PROFILE_URL}/about`,
          method: 'GET',
        }),
      }),
      updateUserAboutInfo :  builder.mutation({
        query: (data) => ({
          url: `${PROFILE_URL}/about/update`,
          method: 'PUT',
          body: data,
        }),
      }),
      getOtherUserProfileCardInfo: builder.query({
        query: ({userId}) => ({
          url: `${PROFILE_URL}/other-user/info`,
          method: 'GET',
          params:{userId},
        }),
      }),
      getOtherUserAboutInfoForProfile : builder.query({
        query: ({userId}) => ({
          url: `${PROFILE_URL}/other-user/about`,
          method: 'GET',
          params:{userId}
        }),
      }),
      getAllQueriesForOtherUserProfile : builder.query({
        query: ({userId, pageNum=1, limitNum=10}) => ({
            url: `${PROFILE_URL}/other-user/queries/all`,
            method: 'GET',
            params:{userId, pageNum, limitNum}
          }),
      }),
      getAllPerspectivesForOtherUserProfile : builder.query({
        query: ({userId, pageNum=1, limitNum=10}) => ({
            url: `${PROFILE_URL}/other-user/perspectives/all`,
            method: 'GET',
            params:{userId, pageNum, limitNum}
          }),
      }),

  })
})

export const {
    useGetUserProfileCardInfoQuery,
    useUpdateProfilePhotoMutation,
    useUpdateProfileNameMutation,
    useGetAllQueriesForUserProfileQuery,
    useGetAllPerspectivesForUserProfileQuery,
    useGetUserAboutInfoForProfileQuery,
    useUpdateUserAboutInfoMutation,
    useGetOtherUserProfileCardInfoQuery,
    useGetOtherUserAboutInfoForProfileQuery,
    useGetAllQueriesForOtherUserProfileQuery,
    useGetAllPerspectivesForOtherUserProfileQuery,

} = profileApiSlice