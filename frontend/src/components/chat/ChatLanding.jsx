import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlassmorphicLandingPage = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
  backdropFilter: 'blur(8px) saturate(200%)',
  WebkitBackdropFilter: 'blur(8px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
  padding: theme.spacing(4),
}));

const ChatLanding = () => {
  return (
    <GlassmorphicLandingPage>
      <Typography variant="h4" component="div" sx={{ marginBottom: 2 }}>
        Welcome to the Chat
      </Typography>
      <Typography variant="body1" component="p">
        Select a conversation from the list on the left to start chatting, or start a new conversation by choosing a user.
      </Typography>
    </GlassmorphicLandingPage>
  );
};

export default ChatLanding;
