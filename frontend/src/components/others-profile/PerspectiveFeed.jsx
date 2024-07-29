import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useTheme } from '@mui/material';
import { useGetAllPerspectivesForOtherUserProfileQuery } from '../../slices/api_slices/profileApiSlice';
import PerspectivePostCard from '../home/PerspectivePostCard';
import QueryPostCardAdminSkeleton from '../skeletons/PerspectiveCardAdminSkeleton';
import ErrorAlertDialog from '../ErrorAlertDialoge';

const PerspectiveFeeds = ({userId}) => {
  const theme = useTheme();

  const [posts, setPosts] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data, error, isLoading, isSuccess, isError, refetch } = useGetAllPostsQuery(
    { postType, postSource, page },
    { refetchOnMountOrArgChange: false } // Prevent automatic refetch
  );

  useEffect(() => {
    if (data && isSuccess === true && data.isUserUnavailable !== true) {
      if (page === 1) {
        setPosts(data.perspectives || []);
        setPage((prevPage) => prevPage + 1);
        refetch();
      } else {
        setTempPosts(data.perspectives || []);
      }
      setHasMore((data.perspectives || []).length > 0);
    }
  }, [data, refetch]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching posts:', error);
      setErrorFlag(JSON.stringify(error?.data?.message || error?.message) || 'Error fetching posts');
      setErrorDialogOpen(true);
    }
  }, [error, isError]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !isLoading) {
      setPosts((prevPosts) => [...prevPosts, ...tempPosts]);
      setPage((prevPage) => prevPage + 1);
      refetch();
    }
  }, [hasMore, isLoading, tempPosts, refetch, page]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorFlag('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundSize: 'cover',
        paddingTop: '0px',
        paddingBottom: '10px',
        margin:'auto'
      }}

      className="test---1"
    >
      <Box
        sx={{
          minWidth: 'fit-content',
          margin:'auto'
        }}
      >
        <Box sx={{  padding: '20px', justifyContent: 'center', minWidth: '500px', maxWidth: '500px', margin:'auto' }}>
          <Box sx={{ marginBottom: '20px', minHeight: '3000px' }}>
          {isLoading ? (
                <>
                <QueryPostCardAdminSkeleton />
                <QueryPostCardAdminSkeleton />
                <QueryPostCardAdminSkeleton />
                </>
            ) : data?.isUserUnavailable === true ? (
                <Typography color="error">{data?.message || "User data currently unavailable."}</Typography>
            ) : (
                posts.map((post) => {
                if (post.post_type === 'queries') {
                    return <PerspectivePostCard key={post._id} post={post} setErrorFlag={setErrorFlag} />;
                }
                return null;
                })
            )}
            {(posts && posts.length === 0 ) && <Typography>No Perspective yet.</Typography>}
          </Box>
        </Box>
      </Box>
      <ErrorAlertDialog
        open={errorDialogOpen}
        handleClose={handleCloseErrorDialog}
        title="Error"
        message={errorFlag}
      />
    </Box>
  );
};

PerspectiveFeeds.propTypes = {
  userId: PropTypes.string.isRequired,
}

export default PerspectiveFeeds;
