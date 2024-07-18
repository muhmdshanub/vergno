import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  // accessToken: localStorage.getItem('accessToken') || null,
  // refreshToken: localStorage.getItem('refreshToken') || null,
};

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setUserCredentials: (state, action) => {
      state.userInfo = action.payload.userData;
      // state.accessToken = action.payload.accessToken;
      // state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('userInfo', JSON.stringify(action.payload.userData));
      // localStorage.setItem('accessToken', action.payload.accessToken);
      // localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    userLogout: (state) => {
      state.userInfo = null;
      // state.accessToken = null;
      // state.refreshToken = null;
      localStorage.removeItem('userInfo');
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken');
    },
  },
});

export const { setUserCredentials, userLogout } = userAuthSlice.actions;

export default userAuthSlice.reducer;
