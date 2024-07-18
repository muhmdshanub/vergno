import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const TypingBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '15px',
  padding: '10px 15px',
  marginBottom: '10px',
  maxWidth: '70%',
  backdropFilter: 'blur(8px) saturate(200%)',
  WebkitBackdropFilter: 'blur(8px) saturate(200%)',
}));

const TypingIndicator = () => {
  return (
    <TypingBox>
      <Typography variant="body1">Typing...</Typography>
    </TypingBox>
  );
};

export default TypingIndicator;
