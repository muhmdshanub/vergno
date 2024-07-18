import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import relativeTime from '../../utils/relativeTime';

const MessageBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  borderRadius: '15px',
  padding: '10px 15px',
  marginBottom: '10px',
  maxWidth: '70%',
  backdropFilter: 'blur(8px) saturate(200%)',
  WebkitBackdropFilter: 'blur(8px) saturate(200%)',
}));

const ReceivedMessage = ({ content, time }) => {
  return (
    <MessageBox>
      <Typography variant="body1">{content}</Typography>
      <Typography variant="caption" color="textSecondary" sx={{display:'flex', justifyContent:'flex-end'}}>
        {relativeTime(time)}
      </Typography>
    </MessageBox>
  );
};

export default ReceivedMessage;
