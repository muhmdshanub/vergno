import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useTheme } from '@mui/material';
import { useGlobalSearchPeopleQuery } from '../../slices/api_slices/globalSearchApiSlice';
import PeopleResultCard from './PeopleResultCard';
import QueryPostCardAdminSkeleton from '../skeletons/QueryCardAdminSkeleton';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import debounce from '../../utils/debounce';

const PeopleResultsFeeds = ({searchBy, selectedTabValue}) => {
  const theme = useTheme();

  const [posts, setPosts] = useState([]);
  const [tempPosts, setTempPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchBy);
  const [hasMore, setHasMore] = useState(true);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const shouldSkip = debouncedSearch.trim().length < 1 ;

  const { data, error, isLoading, isSuccess, isError, refetch } = useGlobalSearchPeopleQuery({
    searchBy: debouncedSearch,
    pageNum : page,
    limitNum : 10
  }, { skip: shouldSkip, });

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
        setPosts(data.users || []);
        setPage((prevPage) => prevPage + 1);
        handleRefetch();
      } else {
        setTempPosts(data.users || []);
      }
      setHasMore((data.users || []).length > 0);
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
        margin:'auto',
        
      }}

      
    >
      <Box
        sx={{
          minWidth: 'fit-content',
          margin:'auto',
          

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
                posts.map((user) => {

                    const name = user.name;
                    const avatarUrl = user?.image?.url || user?.googleProfilePicture || null;
                    const userId = user._id;
                
                    return (<PeopleResultCard key={user._id} name={name} avatarUrl={avatarUrl} userId={userId}  />);
                })
            )}
            {(posts && posts.length ===0 ) && <Typography variant='h6' sx={{color:'#ffffff'}}>No Result.</Typography>}
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


PeopleResultsFeeds.propTypes = {
  searchBy: PropTypes.string,
  selectedTabValue : PropTypes.number.isRequired,
}


export default PeopleResultsFeeds;
