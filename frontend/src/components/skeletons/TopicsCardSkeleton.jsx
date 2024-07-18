import React from 'react';
import { Card, CardContent, Skeleton, Button, Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material';

const GlassmorphicCard = styled(Card)(({ theme }) => ({
  margin: 'auto',
  mt: 5,
  borderRadius: "8px",
  padding: "0px",
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(1px) saturate(200%)',
  WebkitBackdropFilter: 'blur(1px) saturate(200%)',
  position: "relative",
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.6)',
  },
}));

const StylishBox = styled(Box)(({ theme }) => ({
  maxHeight: '150px',
  overflowY: 'auto',
  mb: 2,
  padding: '0 5px',
  textAlign: 'left',
  scrollbarWidth: 'thin',
  scrollbarColor: '#009F06 transparent ',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#ffffff',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent',
    borderRadius: '10px',
    border: `2px solid transparent`,
  },
}));

const GlassmorphicButton = styled(Button)(({ theme }) => ({
  marginTop:'10px',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  color: '#8200AF',
  backdropFilter: 'blur(1px) saturate(200%)',
  WebkitBackdropFilter: 'blur(1px) saturate(200%)',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.3)',
  },
}));

const SuggestionsTopicsCardSkeleton = () => {
  return (
    <GlassmorphicCard elevation={6} sx={{width:'300px'}}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center">
          <Tooltip title="">
            <Skeleton variant="text" width="60%" height="2rem" />
          </Tooltip>

          <StylishBox sx={{width:'100%'}}>
            <Skeleton variant="text" width="100%" height="100px" />
          </StylishBox>

          <GlassmorphicButton variant="contained">
            <Skeleton variant="text" width="100px" />
          </GlassmorphicButton>
        </Box>
      </CardContent>
    </GlassmorphicCard>
  );
};

export default SuggestionsTopicsCardSkeleton;