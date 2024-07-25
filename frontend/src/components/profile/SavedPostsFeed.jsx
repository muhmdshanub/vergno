import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme , Card, CardActions, CardContent, Button, Typography} from '@mui/material';
import { useGetAllSavedPostsQuery, useUnsavePostMutation} from '../../slices/api_slices/allPostsApiSlice';
import QueryPostCard from '../home/QueryPostCard';
import QueryPostCardAdminSkeleton from '../skeletons/QueryCardAdminSkeleton';
import PerspectivePostCard from '../home/PerspectivePostCard';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';



const QueryFeeds = () => {
  const theme = useTheme();

  const [posts, setPosts] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data, error, isLoading, isSuccess, isError, refetch } = useGetAllSavedPostsQuery({
    pageNum : page,
    limitNum : 10
  }, {refetchOnMountOrArgChange: true, });

  const[unsavePost] = useUnsavePostMutation();



  useEffect(() => {
    if (data && isSuccess === true) {
      if (page === 1) {
        setPosts(data.posts || []);
        setPage((prevPage) => prevPage + 1);
        refetch();
      } else {
        setTempPosts(data.posts || []);
      }
      setHasMore((data.posts || []).length > 0);
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


  const handleUnsaveQuery = async (saved_Post_Id) => {
    try {
      const response = await unsavePost({ savedPostId: saved_Post_Id });
      if (response?.data?.success) {
        setPosts((prevPosts) => prevPosts.filter(post => post.savedPostId !== saved_Post_Id));
      }
    } catch (error) {
      console.log("Error in unsaving the saved post:", saved_Post_Id);
    }
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
            ) : (
              posts.map((post) => {
                return (
                  <Card key={post._id} sx={{ backgroundColor: 'transparent' }}>
                    <CardContent sx={{ padding: 0 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '10px' }}>
                        <Button variant="outlined" color="secondary" startIcon={<BookmarkRemoveIcon />} onClick={()=>{handleUnsaveQuery(post.savedPostId)}}>
                          Unsave
                        </Button>
                        <Typography variant="body2" align="center">
                          Saved at {new Date(post.postSavedAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Box mt='5px'>
                        {post.post_type === 'perspectives' ? (
                          <PerspectivePostCard post={post} setErrorFlag={setErrorFlag} />
                        ) : post.post_type === 'queries' ? (
                          <QueryPostCard post={post} setErrorFlag={setErrorFlag} />
                        ) : null}
                      </Box>
                    </CardContent>
                  </Card>
                );
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

export default QueryFeeds;
