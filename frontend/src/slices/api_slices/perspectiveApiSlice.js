import { apiSlice } from './apiSlice';

const PERSPECTIVE_URL = '/users/perspective';

export const perspectiveApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({

        addPerspectiveToProfile: builder.mutation({
            query: (formData) => ({
              url: `${PERSPECTIVE_URL}/add-to-profile`,
              method: 'POST',
              body: formData,
            }),
          }),
        likePerspective: builder.mutation({
            query: ({perspectiveId}) => ({
             url: `${PERSPECTIVE_URL}/like`,
             method: 'POST',
             body: {perspectiveId},
           }),
         }),
        unlikePerspective: builder.mutation({
           query: ({perspectiveId}) => ({
            url: `${PERSPECTIVE_URL}/like`,
            method: 'DELETE',
            body: {perspectiveId},
          }),
        }),

    })
})


export const {
    useAddPerspectiveToProfileMutation,
    useLikePerspectiveMutation,
    useUnlikePerspectiveMutation

  } = perspectiveApiSlice;