import React, { useState, useEffect } from 'react';
import {  styled, Paper, Grid, Box, Button } from '@mui/material';
import TopicsCardSkeleton from '../skeletons/TopicsCardSkeleton';
import { useGetAllSuggestedTopicsQuery } from '../../slices/api_slices/topicsApiSlice';
import SuggestionsTopicsCard from './SuggestionsTopicsCard';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import { useTheme } from '@emotion/react';

const LoginPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  paddingBottom: '70px',
  width: '100%',
  borderRadius: '10px',
  boxShadow: 'none', // No shadow for transparent appearance
  backgroundColor: 'transparent', // Transparent background
  position: 'relative'
}));

const SuggestionTopics = () => {
    const theme = useTheme()
  const [pageNum, setPageNum] = useState(1); // State to manage pageNum
  const [suggestions, setSuggestions] = useState([]);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data: topicsData, isSuccess: suggestionsSuccess, isLoading: suggestionsLoading, isError, error, refetch } = useGetAllSuggestedTopicsQuery({ pageNum, limit: 9 }); // Call the API function


  useEffect(() => {
    if (error) {
      console.error('Error fetching posts:', error);
      setErrorFlag(JSON.stringify(error?.data?.message || error?.message) || 'Error fetching topics data');
      setErrorDialogOpen(true);
    }
  }, [error, isError]);


  useEffect(() => {
    refetch(); // Manually trigger a refetch whenever pageNum changes
  }, [pageNum]);

  useEffect(() => {
    if (suggestionsSuccess && topicsData?.data) {
      setSuggestions(topicsData?.data);
      
    }
  }, [suggestionsSuccess, topicsData]);

  const handleSuggestionClear = (topicId) => {
    setSuggestions(prevTopics => prevTopics.filter(topic => topic._id !== topicId));
  };

  const handleShowMore = () => {
    setPageNum(prevPageNum => prevPageNum + 1); // Increment pageNum when 'Show More' button is clicked
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorFlag('');
  };

  return (
    <LoginPaper elevation={0}> {/* Set elevation to 0 for no shadow */}
      <Grid container spacing={1} sx={{ width: '100%' }}>
        {suggestionsLoading ? (
          Array.from(new Array(8)).map((_, index) => (
            <TopicsCardSkeleton key={index} />
          ))
        ) : suggestionsSuccess && topicsData?.data?.length > 0 ? (
          suggestions.map((topic) => (
            <Grid item xs={12} md={6} lg={4} xl={3} key={topic._id} sx={{padding:'20px'}}>
              {/* Render your actual TopicsCard component here */}
              {/* Example: <TopicsCard topicData={topic} onSuggestionClear={handleSuggestionClear} /> */}
              <SuggestionsTopicsCard topicData={topic} onSuggestionClear={handleSuggestionClear} />
              
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              No more suggested topics for you now.
            </Box>
          </Grid>
        )}
      </Grid>

      <Button
        sx={{
          position: 'absolute',
          right: '25px',
          bottom: '10px',
          backgroundColor: theme.palette.secondaryButton.main,
          '&:hover': {
            backgroundColor: theme.palette.secondaryButtonEnhanced.main, // Set your desired hover background color here
          }
        }}
        onClick={handleShowMore}
        disabled={suggestionsLoading || topicsData?.data?.length <= 0}
      >
        Show More
      </Button>

      <ErrorAlertDialog
        open={errorDialogOpen}
        handleClose={handleCloseErrorDialog}
        title="Error"
        message={errorFlag}
      />


    </LoginPaper>
  );
};

export default SuggestionTopics;
