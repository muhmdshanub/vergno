import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  adminInfo: localStorage.getItem('vergno_adminInfo')
    ? JSON.parse(localStorage.getItem('vergno_adminInfo'))
    : null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem('vergno_adminInfo', JSON.stringify(action.payload));
    },
    logoutAdmin: (state) => {
      state.adminInfo = null;
      localStorage.removeItem('vergno_adminInfo');
    },
  },
});

export const { setAdminCredentials, logoutAdmin } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
