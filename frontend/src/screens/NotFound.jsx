import React from 'react';
import { Box, Typography, useTheme, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        textAlign: 'center',
        margin: 'auto',
        marginTop:"100px",
        backgroundColor: '#000000',  // Background color
        padding: '20px',             // Padding around content
        borderRadius: '4px',         // Rounded corners
        maxWidth: '600px',           // Limit width of the box
                     // Center align horizontally
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: theme.palette.primary.main,  // Secondary color for heading
          marginBottom: '16px',                 // Spacing below heading
        }}
      >
        404 Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: theme.palette.primary.main }}>
        Sorry, the page you're looking for does not exist.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        sx={{
          marginTop: '20px',                     // Spacing above button
          backgroundColor: theme.palette.submitButton?.main,
          color: 'white',
          '&:hover': {
            backgroundColor: theme.palette.ternaryButton?.main,
          },
        }}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFound;
