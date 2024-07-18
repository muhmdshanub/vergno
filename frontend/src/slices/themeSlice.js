import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // mode: localStorage.getItem('vergno_theme') || 'light', // Default to light mode
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('vergno_theme', state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
