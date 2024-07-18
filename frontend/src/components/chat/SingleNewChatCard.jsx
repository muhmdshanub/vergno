import React from 'react';
import { Card, CardContent, Avatar, Typography, Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const ChatCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minWidth:'fit-content',
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.75)', // Slightly more opaque background
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255)', // Slightly more opaque background on hover
    border: '1px solid rgba(209, 213, 219, 0.85)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
}));

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const SingleNewChatCard = ({ userImage, userName,userId,isOnline, handleConversationClick}) => {
  const truncatedName = truncateText(userName, 20);

  const conversation = {
    userImage,
    userName,
    isExistingConversation : false,
    userId,
    isOnline

  }

  return (
    <ChatCard onClick={() => handleConversationClick(conversation)}>
      <Avatar
        src={userImage}
        alt={`${userName}'s profile picture`}
        sx={{ width: 50, height: 50, margin: 1 }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <CardContent sx={{ padding: '8px', position: 'relative' }}>
          <Tooltip title={userName}>
            <Typography variant="subtitle1" sx={{cursor:'pointer'}}>
              {truncatedName}
            </Typography>
          </Tooltip>
        </CardContent>
      </Box>
    </ChatCard>
  );
};

export default SingleNewChatCard;
