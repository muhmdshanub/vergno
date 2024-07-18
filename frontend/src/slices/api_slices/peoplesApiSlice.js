import { apiSlice } from './apiSlice';

const PEOPLES_URL = '/users/peoples';

export const peoplesApiSlice = apiSlice.injectEndpoints({

    endpoints: (builder) => ({
            suggestions: builder.query({
                query: ({ pageNum, limit }) =>({ 
                  url: `${PEOPLES_URL}/suggestions?page=${pageNum}&limit=${limit}`,
                  method: 'GET',
                }),
            }),
            sendFollowRequest: builder.mutation({
                query: ({ followedUserId }) => ({
                  url: `${PEOPLES_URL}/follow`,
                  method: 'POST',
                  body: { followed_user_id: followedUserId },
                }),
            }),
            sendCancelRequest: builder.mutation({
                query: ({ followedUserId }) => ({
                  url: `${PEOPLES_URL}/follow`,
                  method: 'DELETE',
                  body: { followed_user_id: followedUserId },
                }),
            }),
            receivedFollowRequests: builder.query({
              query: ({ page, limit }) => ({
                url: `${PEOPLES_URL}/follow/requests/received?page=${page}&limit=${limit}`,
                method: 'GET',
              }),
          }),
          declineReceivedRequest: builder.mutation({
            query: ({ followingUserId }) => ({
              url: `${PEOPLES_URL}/follow/decline`,
              method: 'DELETE',
              body: { following_user_id: followingUserId },
            }),
          }),
          acceptReceivedRequest: builder.mutation({
            query: ({ followingUserId }) => ({
              url: `${PEOPLES_URL}/follow/accept`,
              method: 'POST',
              body: { following_user_id: followingUserId },
            }),
          }),
          allFollowers: builder.query({
            query: ({ page, limit , sortBy="default" }) => ({
              url: `${PEOPLES_URL}/followers?page=${page}&limit=${limit}&sortBy=${sortBy}`,
              method: 'GET',
            }),
          }),
          removeFollower: builder.mutation({
            query: ({ followingUserId }) => ({
              url: `${PEOPLES_URL}/followers/remove`,
              method: 'DELETE',
              body: { following_user_id: followingUserId },
            }),
          }),
          allFollowings: builder.query({
            query: ({ page, limit , sortBy="default" }) => ({
              url: `${PEOPLES_URL}/followings?page=${page}&limit=${limit}&sortBy=${sortBy}`,
              method: 'GET',
            }),
        }),
        unfollow: builder.mutation({
          query: ({ followedUserId }) => ({
            url: `${PEOPLES_URL}/unfollow`,
            method: 'DELETE',
            body: { followed_user_id: followedUserId },
          }),
        }),
        blockUser: builder.mutation({
          query: ({ blockedUserId }) => ({
            url: `${PEOPLES_URL}/block`,
            method: 'POST',
            body: { blockedUserId },
          }),
        }),
        allBlockings: builder.query({
          query: ({ page, limit , sortBy="default" }) => ({
            url: `${PEOPLES_URL}/blockings?page=${page}&limit=${limit}&sortBy=${sortBy}`,
            method: 'GET',
          }),
      }),
      unblockUser: builder.mutation({
        query: ({ blockedUserId }) => ({
          url: `${PEOPLES_URL}/unblock`,
          method: 'DELETE',
          body: { blockedUserId },
        }),
      }),

    })

})

export const {
    useSuggestionsQuery,
    useSendFollowRequestMutation,
    useSendCancelRequestMutation,
    useReceivedFollowRequestsQuery,
    useDeclineReceivedRequestMutation,
    useAcceptReceivedRequestMutation,
    useAllFollowersQuery,
    useRemoveFollowerMutation,
    useAllFollowingsQuery,
    useUnfollowMutation,
    useBlockUserMutation,
    useAllBlockingsQuery,
    useUnblockUserMutation,


  } = peoplesApiSlice;