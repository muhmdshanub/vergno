import React from 'react';
import PropTypes from 'prop-types'
import { Box, Skeleton } from '@mui/material';
import CommentSkeleton from './skeletons/CommentSkeleton';


const CommentLoading = ({ count = 4 }) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </Box>
  );
};

CommentLoading.propTypes = {
  count: PropTypes.number, // Number of comment skeletons to render
};

export default CommentLoading;
