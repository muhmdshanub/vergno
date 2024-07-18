// ThemeProviderComponent.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../../theme';


const ThemeProviderComponent = ({ children }) => {
  const mode = useSelector((state) => state.theme.mode);

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

ThemeProviderComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProviderComponent;
