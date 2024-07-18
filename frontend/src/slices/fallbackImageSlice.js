// src/store/fallbackImageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fallbackImage: './profile.png', // Default fallback image
};

const fallbackImageSlice = createSlice({
  name: 'fallbackImage',
  initialState,
  reducers: {
    setFallbackImage: (state, action) => {
      state.fallbackImage = action.payload;
    },
  },
});

export const { setFallbackImage } = fallbackImageSlice.actions;

export default fallbackImageSlice.reducer;
