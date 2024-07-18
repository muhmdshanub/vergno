import { createSlice } from '@reduxjs/toolkit';

const notificationCountSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 0,
  },
  reducers: {
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
        state.unreadCount -= 1;
      },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
});

export const { incrementUnreadCount, decrementUnreadCount, resetUnreadCount, setUnreadCount } = notificationCountSlice.actions;
export default notificationCountSlice.reducer;
