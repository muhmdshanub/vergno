import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { useGetAllPerspectivesForUserProfileQuery } from '../../slices/api_slices/profileApiSlice';
import PerspectivePostCard from '../home/PerspectivePostCard';
import QueryPostCardAdminSkeleton from '../skeletons/PerspectiveCardAdminSkeleton';
import AddPerspectivePost from './AddPerspectivePost';
import ErrorAlertDialog from '../ErrorAlertDialoge';

const PerspectiveFeeds = () => {
  const theme = useTheme();

  const [posts, setPosts] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data, error, isLoading, isSuccess, isError, refetch } = useGetAllPerspectivesForUserProfileQuery({
    pageNum : page,
    limitNum : 10
  }, {refetchOnMountOrArgChange: true, });

  useEffect(() => {
    if (data && isSuccess === true) {
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
          <Box sx={{ marginBottom: '20px' }}>
            <AddPerspectivePost />
          </Box>
          <Box sx={{ marginBottom: '20px', minHeight: '3000px' }}>
            {isLoading ? (
              <>
                <QueryPostCardAdminSkeleton />
                <QueryPostCardAdminSkeleton />
                <QueryPostCardAdminSkeleton />
              </>
            ) : (
              posts.map((post) => {
                if (post.post_type === 'perspectives') {
                  return <PerspectivePostCard key={post._id} post={post} setErrorFlag={setErrorFlag} />;
                }
                return null;
              })
            )}
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

export default PerspectiveFeeds;
