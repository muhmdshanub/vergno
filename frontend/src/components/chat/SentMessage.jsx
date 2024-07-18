import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import relativeTime from '../../utils/relativeTime';

const SentMessageBox = styled(Box)(({ theme }) => ({
display:'flex',

  backgroundColor: 'rgba(0, 194, 255 , 0.45)', // Different background color for sent messages
  color:'rgba(0,0,0)',
  borderRadius: '15px',
  padding: '10px 15px',
  marginBottom: '10px',
  maxWidth: '70%',
  marginLeft: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  backdropFilter: 'blur(8px) saturate(200%)',
  WebkitBackdropFilter: 'blur(8px) saturate(200%)',
}));

const SentMessage = ({ content, time, isRead, onDelete }) => {
  return (
    <SentMessageBox >
      <Typography variant="body1" justifyItems='flex-end'>{content}</Typography>
      <Box display="flex" alignItems="center" >
        <Typography variant="caption"  sx={{position:'absolute', left:'10px', color:'rgba(0,0,0, 0.65)',}}>
          {relativeTime(time)}
        </Typography>
        <Box>
            <Typography variant="caption" sx={{color:'rgba(0,0,0, 0.65)', marginRight:'10px'}}>
            {isRead ? 'Read' : 'Sent'}
            </Typography>
            {/* <IconButton size="small" onClick={onDelete} sx={{color:'rgba(255, 0 , 0, 0.75)'}}>
                <DeleteIcon fontSize="small" />
            </IconButton> */}
        </Box>
        
      </Box>
    </SentMessageBox>
  );
};

export default SentMessage;
