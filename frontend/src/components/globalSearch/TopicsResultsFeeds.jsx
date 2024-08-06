import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useTheme } from '@mui/material';
import { useGlobalSearchTopicsQuery } from '../../slices/api_slices/globalSearchApiSlice';
import TopicsResultCard from './TopicsResultCard';
import QueryPostCardAdminSkeleton from '../skeletons/QueryCardAdminSkeleton';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import debounce from '../../utils/debounce';


const TopicsResultsFeeds = ({searchBy, selectedTabValue}) => {
  const theme = useTheme();

  const [posts, setPosts] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchBy);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const shouldSkip = searchBy.trim().length < 1 ;

  const { data, error, isLoading, isSuccess, isError, refetch } = useGlobalSearchTopicsQuery({
    searchBy: debouncedSearch,
    pageNum : page,
    limitNum : 10
  }, {refetchOnMountOrArgChange: true, skip: shouldSkip, });

  // Debounce the search input
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(searchBy), 500);
    handler();
    return () => clearTimeout(handler);
  }, [searchBy]);

  const handleRefetch = () => {
    if (!shouldSkip) {
      refetch();
    }
  };
  
  useEffect(() => {
    if (debouncedSearch.trim().length < 1) {
      setPosts([]);
    }
    setPage(1);
    handleRefetch();
  }, [debouncedSearch]);


  useEffect(() => {
    if (data && isSuccess === true) {
      if (page === 1) {
        setPosts(data.topics || []);
        setPage((prevPage) => prevPage + 1);
        handleRefetch();
      } else {
        setTempPosts(data.topics || []);
      }
      setHasMore((data.topics || []).length > 0);
    }
  }, [data, refetch]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching peoples :', error);
      setErrorFlag(JSON.stringify(error?.data?.message || error?.message) || 'Error fetching poples');
      setErrorDialogOpen(true);
    }
  }, [error, isError]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !isLoading) {
      setPosts((prevPosts) => [...prevPosts, ...tempPosts]);
      setPage((prevPage) => prevPage + 1);
      handleRefetch();
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

        {
          ((posts.length > 1 || (isSuccess && !isLoading)) && searchBy.trim().length > 0) &&(
            <Typography variant='h6' sx={{color:'#ffffff'}} > Search Results for the key word "{searchBy}" . </Typography>
          )
        }

        <Box sx={{  padding: '20px', justifyContent: 'center', minWidth: '500px', maxWidth: '500px', margin:'auto' }}>

          <Box sx={{ marginBottom: '20px', minHeight: '3000px' }}>
            {isLoading ? (
                <>
                {/* <QueryPostCardAdminSkeleton />
                <QueryPostCardAdminSkeleton />
                <QueryPostCardAdminSkeleton /> */}
                <h1>Loading....</h1>
                </>
            ) :  (
                posts.map((topic) => {

                    const name = topic.name;
                    const description = topic.description;
                    const topicId = topic._id;
                
                    return (<TopicsResultCard key={topic._id} name={name} description={description} topicId={topicId}  />);
                })
            )}
            {(posts && posts.length ===0 ) && <Typography variant='h6' sx={{color:'#ffffff'}} >No Topics.</Typography>}
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


TopicsResultsFeeds.propTypes = {
  searchBy: PropTypes.string,
  selectedTabValue : PropTypes.number.isRequired,
}


export default TopicsResultsFeeds;
