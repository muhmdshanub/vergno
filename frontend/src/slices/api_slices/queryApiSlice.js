import { apiSlice } from './apiSlice';

const QUERY_URL = '/users/query';

export const queryApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({

        addQueryToProfile: builder.mutation({
            query: (formData) => ({
              url: `${QUERY_URL}/add-to-profile`,
              method: 'POST',
              body: formData,
            }),
          }),
        likeQuery: builder.mutation({
           query: ({queryId}) => ({
            url: `${QUERY_URL}/like`,
            method: 'POST',
            body: {queryId},
          }),
        }),
        unlikeQuery: builder.mutation({
          query: ({queryId}) => ({
           url: `${QUERY_URL}/like`,
           method: 'DELETE',
           body:{ queryId},
         }),
       }),

    })
})


export const {
    useAddQueryToProfileMutation,
    useLikeQueryMutation,
    useUnlikeQueryMutation,

  } = queryApiSlice;