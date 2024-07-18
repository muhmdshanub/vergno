import React, { useState, useEffect } from 'react';
import { styled, Paper, Grid, Box, Button, Pagination } from '@mui/material';
import TopicsCardSkeleton from '../skeletons/TopicsCardSkeleton';
import { useGetAllFollowingTopicsQuery } from '../../slices/api_slices/topicsApiSlice';
import FollowingsTopicsCard from './FollowingsTopicsCard';
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

const FollowingsTopics = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1); // State to manage page number
  const [followings, setFollowings] = useState([]);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data: topicsData, isSuccess: followingsSuccess, isLoading: followingsLoading, isError, error, refetch } = useGetAllFollowingTopicsQuery({ pageNum: page, limit: 9 }); // Call the API function

  useEffect(() => {
    if (error) {
      console.error('Error fetching posts:', error);
      setErrorFlag(JSON.stringify(error?.data?.message || error?.message) || 'Error fetching topics data');
      setErrorDialogOpen(true);
    }
  }, [error, isError]);

  useEffect(() => {
    refetch(); // Manually trigger a refetch whenever page changes
  }, [page]);

  useEffect(() => {
    if (followingsSuccess && topicsData?.data) {
      setFollowings(topicsData?.data);
    }
  }, [followingsSuccess, topicsData]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorFlag('');
  };

  const onUnfollow = () =>{
    refetch();
  }

  return (
    <LoginPaper elevation={0}> {/* Set elevation to 0 for no shadow */}
      <Grid container spacing={1} sx={{ width: '100%' }}>
        {followingsLoading ? (
          Array.from(new Array(8)).map((_, index) => (
            <TopicsCardSkeleton key={index} />
          ))
        ) : followingsSuccess && topicsData?.data?.length > 0 ? (
          followings.map((topic) => (
            <Grid item xs={12} md={6} lg={4} xl={3} key={topic._id} sx={{ padding: '20px' }}>
              <FollowingsTopicsCard topicData={topic} onUnfollow={onUnfollow} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              No more followed topics for you now.
            </Box>
          </Grid>
        )}
      </Grid>

      
        <Pagination
          count={Math.ceil(topicsData?.totalCount / 9)}
          page={page}
          onChange={handlePageChange}
          sx={{ position: 'absolute', bottom: '10px' }}
          variant="outlined"
          shape="rounded"
          color="primary"
        />
      

      <ErrorAlertDialog
        open={errorDialogOpen}
        handleClose={handleCloseErrorDialog}
        title="Error"
        message={errorFlag}
      />
    </LoginPaper>
  );
};

export default FollowingsTopics;
