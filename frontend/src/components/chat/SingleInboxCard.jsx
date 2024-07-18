import React from 'react';
import { Card, CardContent, Avatar, Typography, Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import relativeTime from '../../utils/relativeTime';

const ChatCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
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

const SingleInboxCard = ({ userImage, userName,isOnline, lastMessage, messageTime, isLastMessageFromCurrentUser,  handleConversationClick, unreadMessages, conversationId, userId }) => {
  
  const truncatedName = userName ? truncateText(userName, 10) : '';
  const truncatedMessage = lastMessage ? truncateText(lastMessage, 15) : '';


  const conversation = {
    userImage,
    userName,
    userId,
    isOnline,
    isExistingConversation : true,
    conversationId,
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
            <Typography variant="subtitle2" sx={{cursor:'pointer'}}>
              {truncatedName}
            </Typography>
          </Tooltip>
          <Typography variant="body2" color="textSecondary" sx={{width:'100%'}}>
            {!isLastMessageFromCurrentUser ? truncatedMessage : `You: ${truncatedMessage}`}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ position: 'absolute', bottom: '5px', right: '10px' }}>
            {relativeTime(new Date(messageTime))}
          </Typography>
        </CardContent>
      </Box>
      {unreadMessages > 0 && (
        <Box
          sx={{
            position:'absolute',
            top:'30%',
            right:'10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            backgroundColor: 'red',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            
          }}
        >
          {unreadMessages}
        </Box>
      )}
    </ChatCard>
  );
};

export default SingleInboxCard;
