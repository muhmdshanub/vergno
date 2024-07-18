import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { setUserCredentials, userLogout } from '../userAuthSlice';

// Update baseQuery to include credentials
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL,
  credentials: 'include', // Include credentials with every request
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery('/users/refresh-token', api, extraOptions);
    
    if (refreshResult?.data?.success === true) {
      
      
      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      
      // Logout the user if refresh fails
      api.dispatch(userLogout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Admin', 'Post', 'Group'],
  endpoints: (builder) => ({}),
});

export default apiSlice;
