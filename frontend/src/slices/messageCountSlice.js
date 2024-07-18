import { createSlice } from '@reduxjs/toolkit';

const messageCountSlice = createSlice({
  name: 'messages',
  initialState: {
    unreadMessageCount: 0,
  },
  reducers: {
    incrementUnreadMessageCount: (state) => {
      state.unreadMessageCount += 1;
    },
    decrementUnreadMessageCount: (state) => {
        state.unreadMessageCount -= 1;
      },
    resetUnreadMessageCount: (state) => {
      state.unreadMessageCount = 0;
    },
    setUnreadMessageCount: (state, action) => {
      state.unreadMessageCount = action.payload;
    },
  },
});

export const { incrementUnreadMessageCount, decrementUnreadMessageCount, resetUnreadMessageCount, setUnreadMessageCount } = messageCountSlice.actions;
export default messageCountSlice.reducer;
