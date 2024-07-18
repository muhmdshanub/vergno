import React from 'react';
import { Box, Skeleton, Card, Avatar, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';

const CommentSkeleton = () => {
  return (
    <Box style={{ display: 'flex', marginBottom: '10px' }}>
      <Box style={{ marginRight: '10px' }}>
        <Skeleton variant="circular" width={56} height={56} />
      </Box>
      <Box style={{ width: '100%' }}>
        <Box style={{ display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" height={50} style={{ marginTop: '5px' }} />
        </Box>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '10px', marginTop: '10px' }}>
          <Skeleton variant="text" width="10%" />
          <Skeleton variant="text" width="10%" />
          <Skeleton variant="text" width="10%" />
          <Skeleton variant="text" width="10%" />
          <Skeleton variant="text" width="10%" />
        </Box>
        <Skeleton variant="text" width="20%" style={{ marginTop: '10px' }} />
        <Skeleton variant="rectangular" height={100} style={{ marginTop: '10px', borderRadius: '10px' }} />
      </Box>
    </Box>
  );
};

export default CommentSkeleton;