// src/store/logoImageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logoImage: 'https://res.cloudinary.com/dxclujjda/image/upload/v1719675803/logo-png_yh9vqk.png', // Default logo image
  logoTransparentImage: 'https://res.cloudinary.com/dxclujjda/image/upload/v1721228006/logo-transparent-png_kq5wii.png',
};

const logoImageSlice = createSlice({
  name: 'logoImage',
  initialState,
  reducers: {
    setLogoImage: (state, action) => {
      state.logoImage = action.payload;
    },
  },
});

export const { setLogoImage } = logoImageSlice.actions;

export default logoImageSlice.reducer;
