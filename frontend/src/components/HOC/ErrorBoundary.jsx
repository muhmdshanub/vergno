import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, styled } from '@mui/material';

// Define styled components
const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f0f0f0',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  textAlign: 'center',
  maxWidth: '600px',
  margin: 'auto',
  marginTop: theme.spacing(4),
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginBottom: theme.spacing(2),
}));

const ReloadButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

class StyledErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger rendering of fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log the error to an error reporting service
    console.error("Error caught by Error Boundary:", error, info);
    // Display error using a dialog or snackbar here, if needed
  }

  handleReload = () => {
    // Reload the page or take any other action to recover from the error
    window.location.reload();
  };

  render() {
    const { children } = this.props;

    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorMessage variant="h5">
            Something went wrong.
          </ErrorMessage>
          <Typography variant="body1">
            An unexpected error occurred. Please try again later.
          </Typography>
          <ReloadButton
            variant="contained"
            onClick={this.handleReload}
          >
            Reload Page
          </ReloadButton>
        </ErrorContainer>
      );
    }

    return children; // Render children normally
  }
}

StyledErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StyledErrorBoundary;
