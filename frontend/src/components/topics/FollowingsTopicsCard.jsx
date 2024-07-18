import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Button, Box, Tooltip, Snackbar, Alert, IconButton } from '@mui/material';
import { useTheme } from '@emotion/react';
import {useFollowTopicMutation,useUnfollowTopicMutation} from '../../slices/api_slices/topicsApiSlice';
import { useSelector } from 'react-redux';
import { Close } from '@mui/icons-material';
import GradientCircularProgress from '../GradientCircularProgress';
import { styled } from '@mui/material';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import { useNavigate } from 'react-router-dom';

const GlassmorphicCard = styled(Card)(({ theme }) => ({
  margin: 'auto',
  mt: 5,
  borderRadius: "8px",
  padding: "0px",
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(2px) saturate(180%)',
  WebkitBackdropFilter: 'blur(2px) saturate(180%)',
  position: "relative",
  '&:hover': {
    background: 'rgba(255, 255, 255, 1)',
  },
}));


// Custom styled Box with a stylish scrollbar
const StylishBox = styled(Box)(({ theme }) => ({
    maxHeight: '150px',
    overflowY: 'auto',
    mb: 2,
    padding: '0 5px',
    textAlign: 'left',
    scrollbarWidth: 'thin', // For Firefox
    scrollbarColor: '#FFFFFF transparent ', // For Firefox
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#ffffff',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
      borderRadius: '10px',
      border: `2px solid transparent`,
    },
  }));


  const GlassmorphicButton = styled(Button)(({ theme }) => ({
    marginTop:'10px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#8200AF',
    backdropFilter: 'blur(1px) saturate(200%)',
    WebkitBackdropFilter: 'blur(1px) saturate(200%)',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.2)',
    },
  }));

const FollowingsTopicsCard = ({topicData, onUnfollow }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);


   const [unfollowTopic, { isLoading: unfollowLoading, isSuccess: unfollowSuccess }] = useUnfollowTopicMutation();

  

  const handleUnfollow = async () => {
    try {
      await unfollowTopic({ topicId: topicData._id }).unwrap();
      onUnfollow();
    } catch (error) {
        setErrorFlag(JSON.stringify(error?.data?.message || error?.message) || 'Error unfollowing topic');
        setErrorDialogOpen(true);
      console.error('Failed to send unfollow request:', error);
    }
  };

;

const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorFlag('');
  };


  return (
    <GlassmorphicCard elevation={6} >
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center">
          <Tooltip title={topicData?.name }>
            <Typography variant="h6" component="div" sx={{ cursor: 'pointer', mb: 2, mt: 0, width: '80%', height: '2rem', overflow: 'hidden', display: "flex", justifyContent: "flex-start", color: "#8E0505" }} onClick={()=> navigate(`/topics/${topicData?._id}`)}>
              <span>{topicData.name}</span>
            </Typography>
          </Tooltip>

          <StylishBox>
            <Typography variant="body1">
              {topicData?.description}
            </Typography>
          </StylishBox>

          
            <GlassmorphicButton variant="contained" onClick={handleUnfollow}>
              {unfollowLoading ? <GradientCircularProgress /> : 'Unfollow'}
            </GlassmorphicButton>
          


        </Box>
      </CardContent>

      <ErrorAlertDialog
        open={errorDialogOpen}
        handleClose={handleCloseErrorDialog}
        title="Error"
        message={errorFlag}
      />

    </GlassmorphicCard>
  );
};

FollowingsTopicsCard.propTypes = {
  topicData: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FollowingsTopicsCard;
