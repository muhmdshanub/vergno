import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Snackbar, Alert, Box, Container, Grid, Typography, FormControl, Select, MenuItem, useTheme, useMediaQuery, Hidden, styled } from '@mui/material';
import UserProfileCard from '../components/user/UserProfileCard';
import TopicsCard from '../components/home/Topicscard';
import GroupsCard from '../components/home/GroupsCard';
import AddPost from '../components/home/AddPost';
import QueryPostCard from '../components/home/QueryPostCard';
import PerspectivePostCard from '../components/home/PerspectivePostCard';
import { useGetAllPostsQuery } from '../slices/api_slices/allPostsApiSlice';
import LoadingModal from '../components/LoadingModal';
import QueryPostCardAdminSkeleton from '../components/skeletons/QueryCardAdminSkeleton';
import { useGetTopicsSuggestionsForHomeQuery } from '../slices/api_slices/topicsApiSlice';
import ErrorAlertDialog from '../components/ErrorAlertDialoge';


const GlassmorphicFormControl = styled(FormControl)(({theme})=>({
  
    m: 1,
    minWidth: 120,
    backgroundColor: 'rgba(7, 135, 176, 0.75)', // Semi-transparent background
    backdropFilter: 'blur(6px) saturate(150%)', // Blur and saturation for the glass effect
    WebkitBackdropFilter: 'blur(8px) saturate(180%)', // For Safari support
    border: '1px solid rgba(255, 255, 255, 0.3)', // Semi-transparent border
    borderRadius: '8px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  
}))


const HomeScreen = () => {
  const theme = useTheme();
  const { userInfo } = useSelector((state) => state.userAuth);
  const { fallbackImage } = useSelector((state) => state.fallbackImage);

  const isSmallUp = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'));

  const minWidthStyle = !isSmallUp ? '400px' : '960px';
  const leftNavWidth = isLargeUp ? '350px' : '280px';

  const [posts, setPosts] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postType, setPostType] = useState('all_posts');
  const [postSource, setPostSource] = useState('from_all');
  const [errorFlag, setErrorFlag] = useState('');
  const [ topics, setTopics] = useState([])

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');


  const { data, error, isLoading,isSuccess,isError, refetch } = useGetAllPostsQuery(
    { postType, postSource, page },
  );

  const {data : topicsData, error: topicsError,isError :  isTopicsError,  isLoading: isTopicsLoading, isSuccess : isTopicsSuccess, refetch : refetchTopics } = useGetTopicsSuggestionsForHomeQuery();

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
    
  }, [ data,isSuccess]);




  useEffect(()=>{
   
    setTempPosts([]);
    
    setPage(1);
    refetch();
  },[postSource, postType])

  useEffect(()=>{
    if (error) {
      console.error('Error fetching posts:', error);
      setErrorFlag(JSON.stringify(error?.data?.message || error?.message) || 'Error fetching posts');
    }
  }, [isError])

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !isLoading) {
      setPosts((prevPosts) => {
        const newPosts = tempPosts.filter(
          (tempPost) => !prevPosts.some((prevPost) => prevPost._id === tempPost._id)
        );
        return [...prevPosts, ...newPosts];
      });
      
      setPage((prevPage) => prevPage + 1);
      refetch();
    }
  }, [hasMore, isLoading, tempPosts, refetch, page]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handlePostTypeChange = (newType) => {
    setPostType(newType);
    
  };

  const handlePostSourceChange = (newSource) => {
    setPostSource(newSource);
   
  };

  const handleCloseSnackbar = () => {
    setErrorFlag('');
  };


  //setiings for dealing topics data from api

  useEffect(()=>{

    if(isTopicsSuccess && topicsData){
      
      setTopics([...topicsData.topics])
    }

  },[isTopicsSuccess, topicsData])


  useEffect(()=>{

    if(isTopicsError && topicsError){
      setErrorDialogOpen(true);
      setErrorDialogTitle('Topic Suggestions');
      setErrorDialogMessage(`Error getting the topic suggestions : `);
      console.log(topicsError)

    }

  },[isTopicsError, topicsError])


  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

  return (
    <Box
      sx={{
        
        minHeight: '100vh',
        backgroundSize: 'cover',
        paddingTop: '0px',
        paddingBottom: '10px',
      }}
    >
      <Container
        sx={{
          minWidth: minWidthStyle,
          overflowX: 'auto',
        }}
      >
        <Grid container spacing={1} style={{ justifyContent: 'space-between' }}>
          <Hidden mdDown>
            <Grid item md={3} sx={{ marginRight: '60px' }}>
              <Box sx={{  padding: '20px', justifyContent: 'space-between', minWidth: leftNavWidth }}>
                <div style={{ marginBottom: '20px' }}>
                  <UserProfileCard />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <TopicsCard topics={topics} />
                </div>
                {/* <div style={{ marginBottom: '20px' }}>
                  <GroupsCard />
                </div> */}
              </Box>
            </Grid>
          </Hidden>
          
          <Grid item xs={12} md={8} sx={{ alignItems: 'center', justifyContent: 'center', justifyItems: 'center' }}>
            <Box sx={{  padding: '20px', justifyContent: 'center', minWidth: '500px', maxWidth: '500px' }}>
              <div style={{ marginBottom: '20px' }}>
                <AddPost />
              </div>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <GlassmorphicFormControl >
                  <Select
                    value={postType}
                    onChange={(e) => handlePostTypeChange(e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={{ color: theme.palette.primary.main, borderRadius: '8px' }}
                  >
                    <MenuItem value="all_posts">All Posts</MenuItem>
                    <MenuItem value="queries">Queries</MenuItem>
                    <MenuItem value="perspectives">Perspectives</MenuItem>
                  </Select>
                </GlassmorphicFormControl>
                <GlassmorphicFormControl >
                  <Select
                    value={postSource}
                    onChange={(e) => handlePostSourceChange(e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    style={{ color: theme.palette.primary.main, borderRadius: '8px' }}
                  >
                    <MenuItem value="from_all">From All</MenuItem>
                    <MenuItem value="from_users">From users</MenuItem>
                    <MenuItem value="from_topics">From Topics</MenuItem>
                  </Select>
                </GlassmorphicFormControl>
              </Box>
              <Box sx={{ marginBottom: '20px' , minheight:"3000px", backgroundColor:'transparent'}}>
                { (isLoading) ? (
                  <>
                    <QueryPostCardAdminSkeleton />
                    <QueryPostCardAdminSkeleton />
                    <QueryPostCardAdminSkeleton />
                  </>
                ) : (
                  posts.map((post) => {
                    
                    if (post.post_source !== 'from_groups') {
                      if (post.post_type === 'queries') {
                        return <QueryPostCard key={post._id} post={post} setErrorFlag={setErrorFlag} />;
                      } else if (post.post_type === 'perspectives') {
                        return <PerspectivePostCard key={post._id} post={post} setErrorFlag={setErrorFlag} />;
                      }
                    }
                    return null;
                  })
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={errorFlag.length > 0} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorFlag}
        </Alert>
      </Snackbar>

      {(!!errorDialogOpen) && (
        <ErrorAlertDialog
        open={errorDialogOpen}
        handleClose={handleCloseErrorDialog}
        title={errorDialogTitle}
        message={errorDialogMessage}
      />
      )}

    </Box>
  );
};

export default HomeScreen;
