import { apiSlice } from './apiSlice';

const GLOBAL_SEARCH_URL = '/users/search/global';

export const globalSearchApiSlice = apiSlice.injectEndpoints({

    endpoints: (builder) => ({
        
          globalSearchPeople: builder.query({
            query: ({searchBy, pageNum=1, limitNum=10}) => ({
              url: `${GLOBAL_SEARCH_URL}/people`,
              method: 'GET',
              params: { searchBy, pageNum, limitNum },
            }),
          }),
          globalSearchTopics: builder.query({
            query: ({searchBy, pageNum=1, limitNum=10}) => ({
              url: `${GLOBAL_SEARCH_URL}/topics`,
              method: 'GET',
              params: { searchBy, pageNum, limitNum },
            }),
          }),
          globalSearchQueries: builder.query({
            query: ({searchBy, pageNum=1, limitNum=10}) => ({
              url: `${GLOBAL_SEARCH_URL}/queries`,
              method: 'GET',
              params: { searchBy, pageNum, limitNum },
            }),
          }),
          globalSearchPerspectives: builder.query({
            query: ({searchBy, pageNum=1, limitNum=10}) => ({
              url: `${GLOBAL_SEARCH_URL}/perspectives`,
              method: 'GET',
              params: { searchBy, pageNum, limitNum },
            }),
          }),
          

    })
})

export const {
    useGlobalSearchPeopleQuery,
    useGlobalSearchQueriesQuery,
    useGlobalSearchPerspectivesQuery,
    useGlobalSearchTopicsQuery,



} = globalSearchApiSlice