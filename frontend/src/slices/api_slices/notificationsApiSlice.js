import { apiSlice } from './apiSlice';

const NOTIFICATIONS_URL = '/users/notifications';

export const notificationsApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({

        unreadNotificationsCount: builder.query({
            query: () =>({ 
              url: `${NOTIFICATIONS_URL}/unread/count`,
              method: 'GET',
            }),
        }),
        allNotifications: builder.query({
            query: ({page, limit=20}) =>({ 
              url: `${NOTIFICATIONS_URL}/all?page=${page}&limit=${limit}`,
              method: 'GET',
            }),
        }),
        markAsRead: builder.mutation({
          query: ({ notificationId }) => ({
            url: `${NOTIFICATIONS_URL}/mark-as-read`,
            method: 'POST',
            body: { notification_id: notificationId },
          }),
        }),

    })
})


export const {
    useUnreadNotificationsCountQuery,
    useAllNotificationsQuery,
    useMarkAsReadMutation

  } = notificationsApiSlice;