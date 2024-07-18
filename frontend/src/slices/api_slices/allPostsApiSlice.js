import { apiSlice } from './apiSlice';

const ALL_POSTS_URL = '/users/posts';

export const allPostsApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({

        getAllPosts: builder.query({
            query: ({postType, postSource, page}) => ({
              url: `${ALL_POSTS_URL}/all`,
              method: 'GET',
              params: { postType: postType, postSource: postSource, page: page, limit: 10 },
            }),
          }),
        reportPost: builder.mutation({
            query: ({ reason, post_type, post_source, post_id }) => ({
              url: `${ALL_POSTS_URL}/report`,
              method: 'POST',
              body: { reason, post_type, post_source, post_id },
            }),
          }),
    })
})


export const {
    useGetAllPostsQuery,
    useReportPostMutation

  } = allPostsApiSlice;