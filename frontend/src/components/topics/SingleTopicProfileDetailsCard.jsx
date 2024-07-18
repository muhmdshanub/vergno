import React, { useEffect, useState } from 'react';
import { styled, Paper, Grid, Box, Typography, Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useGetSingleTopicDetailsQuery, useFollowTopicMutation, useUnfollowTopicMutation } from '../../slices/api_slices/topicsApiSlice';



const GlassmorphicPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  color: '#ffffff',
  padding: '20px',
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  }
}));

const topic = {
  name: 'Artificial Intelligence',
  description: `
    Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. AI has a wide range of applications, from natural language processing and speech recognition to autonomous vehicles and predictive analytics. It enables machines to perform tasks that typically require human intelligence, such as visual perception, decision-making, and language translation. The development and deployment of AI technologies are transforming industries and everyday life, promising advancements in healthcare, finance, education, and more.
  `,
  followersCount: 12345, // Number of followers
  isFollowing: false, // Assuming the user is not following initially
};

const SingleTopicProfileDetailsCard = ({topicId}) => {
  const theme = useTheme();
  
  const [topicData,setTopicData] = useState()

  // Fetch user profile card info using query hook
  const { data, error,isSuccess, isLoading, refetch } = useGetSingleTopicDetailsQuery({topicId});

  const [follow, { isLoading : isFollowLoading, isSuccess : isFollowSuccess }] = useFollowTopicMutation();
  const [unfollow, { isLoading : isUnfollowLoading, isSuccess : isUnfollowSuccess }] = useUnfollowTopicMutation();

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');


  useEffect(()=>{
    if(isSuccess === true){
      setTopicData(data?.data);
    }
  },[isSuccess, data, refetch])

  const handleUnfollow = async () => {
    try {
      await unfollow({ topicId }).unwrap();
      refetch();
    } catch (error) {

    setErrorDialogOpen(true);
    setErrorDialogTitle('Unfollow Error');
    setErrorDialogMessage('Failed to Unfollow. Please try again.');
      console.error('Failed to Unfollow :', error);
    }
  };

  
  const handleFollow = async () => {
    try {
      await follow({ topicId }).unwrap();
      refetch()
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Follow Error');
      setErrorDialogMessage('Failed to Follow. Please try again.');
      console.error('Failed to send follow request:', error);
    }

  } 


  const handleFollowToggle = () => {
    if(topicData?.isFollowing){
      handleUnfollow()
    }else{
      handleFollow()
    }
  };

  return (
    <GlassmorphicPaper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            {topicData?.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            {topicData?.description}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" component="p">
             {topicData?.followersCount} people are following.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color={topicData?.isFollowing ? 'secondary' : 'primary'}
            onClick={handleFollowToggle}
            sx={{
              backgroundColor: topicData?.isFollowing
                ? theme.palette.secondary.main
                : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: topicData?.isFollowing
                  ? theme.palette.secondary.dark
                  : theme.palette.primary.dark,
              },
            }}
          >
            {topicData?.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        </Grid>
      </Grid>
    </GlassmorphicPaper>
  );
};

export default SingleTopicProfileDetailsCard;
