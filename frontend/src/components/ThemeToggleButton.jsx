// Example component to toggle theme
import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../slices/themeSlice';

const ThemeToggleButton = () => {
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(toggleTheme())}>
      Toggle Theme
    </button>
  );
};

export default ThemeToggleButton;
