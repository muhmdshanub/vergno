import { apiSlice } from './apiSlice';

const TOPICS_URL = '/users/topics';

export const topicsApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({

        autofillSuggestions: builder.query({
            query: ({search}) =>({ 
              url: `${TOPICS_URL}/auto-fill/suggestions?search=${search}`,
              method: 'GET',
            }),
        }),
        getAllSuggestedTopics : builder.query({
            query: ({pageNum = 1, limitNum = 10}) =>({ 
              url: `${TOPICS_URL}/suggestions`,
              method: 'GET',
              params:{pageNum, limitNum}
            }),
        }),
        followTopic: builder.mutation({
            query: ({ topicId }) => ({
              url: `${TOPICS_URL}/follow`,
              method: 'POST',
              body: { topicId },
            }),
        }),
        unfollowTopic: builder.mutation({
            query: ({ topicId }) => ({
              url: `${TOPICS_URL}/unfollow`,
              method: 'DELETE',
              body: { topicId},
            }),
        }),
        getAllFollowingTopics : builder.query({
          query: ({pageNum = 1, limitNum = 10}) =>({ 
            url: `${TOPICS_URL}/followings`,
            method: 'GET',
            params:{pageNum, limitNum}
          }),
      }),
      getSingleTopicDetails : builder.query({
        query: ({topicId}) =>({ 
          url: `${TOPICS_URL}/single/details`,
          method: 'GET',
          params:{topicId}
        }),
      }),

      getAllQueriesForTopic : builder.query({
        query: ({topicId, pageNum=1, limitNum=10}) =>({ 
          url: `${TOPICS_URL}/single/queries`,
          method: 'GET',
          params:{topicId, pageNum, limitNum}
        }),
      }),
      getAllPerspectivesForTopic : builder.query({
        query: ({topicId, pageNum=1, limitNum=10}) =>({ 
          url: `${TOPICS_URL}/single/perspectives`,
          method: 'GET',
          params:{topicId, pageNum, limitNum}
        }),
      }),
      getTopicsSuggestionsForHome : builder.query({
        query : () =>({
          url: `${TOPICS_URL}/home/suggestions`,
          method: 'GET',
        }),
      }),


    })
})


export const {
    useAutofillSuggestionsQuery,
    useLazyAutofillSuggestionsQuery,
    useGetAllSuggestedTopicsQuery,
    useFollowTopicMutation,
    useUnfollowTopicMutation,
    useGetAllFollowingTopicsQuery,
    useGetAllPerspectivesForTopicQuery,
    useGetAllQueriesForTopicQuery,
    useGetSingleTopicDetailsQuery,
    useGetTopicsSuggestionsForHomeQuery,

  } = topicsApiSlice;