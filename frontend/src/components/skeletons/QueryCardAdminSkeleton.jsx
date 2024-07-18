import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, Box, Button, Badge } from '@mui/material';
import { Favorite, Comment, CheckCircle, Tag, HelpOutline } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@emotion/react';

const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#f0faff',
  borderRadius: '16px',
}));

const PostContent = styled(CardContent)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
}));

const ImageContainer = styled(Box)({
  width: '100%',
  height: '200px',
  backgroundColor: 'black',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '10px',
  marginBottom: '10px',
  position: 'relative',
});

const PostActions = styled(CardActions)(({ theme }) => ({
  justifyContent: 'space-between',
  padding: `0 ${theme.spacing(2)}px ${theme.spacing(2)}px`,
}));

const QueryPostCardAdminSkeleton = () => {
  const theme = useTheme();

  return (
    <PostCard>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={
          <Box display="flex" alignItems="center">
            <Skeleton variant="text" width={100} />
          </Box>
        }
        subheader={<Skeleton variant="text" width={80} />}
      />
      <PostContent style={{ paddingTop: '0px', marginTop: '0px' }}>
        <Box style={{ marginBottom: '10px', marginTop: '0px' }}>
          <Skeleton variant="text" width="60%" />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="5px" width="100%">
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0px" width="100%">
            <Button variant="outlined" size="small" style={{ background: theme.palette.ternaryButton.main, borderRadius: '5px', marginRight: '10px' }} disabled>
              <HelpOutline style={{ color: '#c70039' }} />
              <Skeleton variant="text" width={50} />
            </Button>
            <Button variant="outlined" size="small" style={{ background: theme.palette.ternaryButton.main, borderRadius: '5px', color: '#363636' }} disabled>
              <Tag />
              <Skeleton variant="text" width={50} />
            </Button>
          </Box>
        </Box>
        <ImageContainer>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </ImageContainer>
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
        </Box>
      </PostContent>
      <PostActions style={{ color: theme.palette.secondary.main, justifyItems: 'space-around' }}>
        <Box display="flex" alignItems="center" justifyItems="space-between" justifyContent="space-between">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginRight: '2rem' }}>
            <IconButton aria-label="like" style={{ color: 'inherit' }} disabled>
              <Favorite />
            </IconButton>
            <Skeleton variant="text" width={30} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
            <IconButton aria-label="comment" style={{ color: theme.palette.secondary.main }} disabled>
              <Comment />
            </IconButton>
            <Skeleton variant="text" width={30} />
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
            <IconButton aria-label="answers" style={{ color: theme.palette.secondary.main }} disabled>
              <Badge sx={{ marginRight: 1 }}>
                <CheckCircle />
              </Badge>
            </IconButton>
            <Skeleton variant="text" width={30} />
          </Box>
        </Box>
      </PostActions>
    </PostCard>
  );
};

export default QueryPostCardAdminSkeleton;
