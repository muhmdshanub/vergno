import React from 'react';
import { Skeleton, Box, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const SkeletonContainer = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px', // Adjust padding as needed
  
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



const CircularSkeleton = styled(Skeleton)({
  marginRight: '10px', // Space between the circle and rectangles
});

const RectangularSkeleton = styled(Skeleton)({
  marginBottom: '5px', // Space between the two rectangles
});

const InboxConversationCardSkeleton = () => {
  return (
    <SkeletonContainer>
      <CircularSkeleton variant="circular" width={40} height={40} />
      <Box>
        <RectangularSkeleton variant="rectangular" width={150} height={10} />
        <RectangularSkeleton variant="rectangular" width={100} height={10} />
      </Box>
    </SkeletonContainer>
  );
};

export default InboxConversationCardSkeleton;
