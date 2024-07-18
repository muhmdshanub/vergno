import messageCountSlice from '../messageCountSlice';
import { apiSlice } from './apiSlice';

const MESSAGE_URL = '/users/message';

export const messagesApiSlice = apiSlice.injectEndpoints({


    endpoints: (builder) => ({
        unreadMessageCount: builder.query({
            query: () =>({ 
              url: `${MESSAGE_URL}/unreadCount`,
              method: 'GET',
            }),
        }),

        getAllExistingConversations: builder.query({
            query: ({pageNum = 1, limitNum = 10, searchBy=''}) =>({ 
              url: `${MESSAGE_URL}/conversations/existing`,
              method: 'GET',
              params:{pageNum, limitNum , searchBy}
            }),
        }),

        getSignleExistingConversations: builder.query({
          query: ({conversationId}) =>({ 
            url: `${MESSAGE_URL}/conversations/existing/single`,
            method: 'GET',
            params:{conversationId}
          }),
      }),

        getAllNewConversations: builder.query({
            query: ({pageNum = 1, limitNum = 10, searchBy=''}) =>({ 
              url: `${MESSAGE_URL}/conversations/new`,
              method: 'GET',
              params:{pageNum, limitNum , searchBy}
            }),
        }),
        checkCanSendMessage: builder.query({
          query: ({recipientId}) =>({ 
            url: `${MESSAGE_URL}/check/canSendMessage`,
            method: 'GET',
            params: {recipientId},
          }),
      }),
      sendMessage : builder.mutation({
        query: ({ type = 'text',  text, recipientId, isExistingConversation, conversationId }) => ({
          url: `${MESSAGE_URL}/send`,
          method: 'POST',
          body: { type ,  text, recipientId, isExistingConversation, conversationId },
        }),
      }),
      getAllMessagesForConversation : builder.query({
        query: ({ conversationId,  pageNum = 1, limitNum = 10, initialFetch = false }) =>({ 
          url: `${MESSAGE_URL}/all`,
          method: 'GET',
          params: { conversationId,  pageNum, limitNum, initialFetch  },
        }),
    }),
    markAsReadMessage : builder.mutation({
      query: ({ messageId }) => ({
        url: `${MESSAGE_URL}/read`,
        method: 'POST',
        body: { messageId },
      }),
    }),


    })
}) 

export const {
  useUnreadMessageCountQuery,
  useGetAllExistingConversationsQuery,
  useLazyGetSignleExistingConversationsQuery,
  useGetAllNewConversationsQuery,
  useCheckCanSendMessageQuery,
  useSendMessageMutation,
  useLazyGetAllMessagesForConversationQuery,
  useMarkAsReadMessageMutation,


} = messagesApiSlice;