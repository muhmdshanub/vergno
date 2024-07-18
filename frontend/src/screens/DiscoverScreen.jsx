import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Card } from '@mui/material';
import CustomizedSwitch from '../components/discover/CustomizedSwitch';
import { styled } from '@mui/material/styles';
import DiscoverCard from '../components/discover/DiscoverCard';
import ResultsCard from '../components/discover/ResultsCard';
import { useToggleDiscoverEnableMutation, useGetIsDiscoverEnabledQuery, useLazyDiscoverSimilarTopicFollowingsQuery } from '../slices/api_slices/userApiSlice';
import ErrorAlertDialog from '../components/ErrorAlertDialoge';

const GlassmorphicInboxPaper = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 64px)', // Assuming a fixed header height of 64px
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
  },
}));

const DiscoverScreen = () => {

  
  const [enabled, setEnabled] = useState(false);
  const [results, setResults] = useState([])

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');



  const {data : discoverEnabledStatus, isLoading: discoverEnabledStatusLoading, isSuccess: discoverEnabledStatusSuccess, error: discoverEnabledStatusError, isError: isDiscoverEnabledStatusError} = useGetIsDiscoverEnabledQuery();
  const[fetchDiscoverSimilarUsers,{data : discoverData, error : discoverError, isLoading : isDiscoverLoading, isSuccess : isDiscoverSuccess, isError : isDiscoverError}] = useLazyDiscoverSimilarTopicFollowingsQuery();
  const [toggleDiscoverEnable] = useToggleDiscoverEnableMutation();



  useEffect(()=>{
    if(discoverEnabledStatusSuccess === true && discoverEnabledStatus){
      setEnabled( discoverEnabledStatus?.isDiscoverEnabled)
    }
  },[discoverEnabledStatusSuccess, discoverEnabledStatus])

  useEffect(()=>{
    if(isDiscoverEnabledStatusError && discoverEnabledStatusError){
          setErrorDialogOpen(true);
          setErrorDialogTitle('Discover Error');
          setErrorDialogMessage(`An error occurred during getting  the current status : ${discoverEnabledStatusError?.data?.message}`);
    }
  },[discoverEnabledStatusError, isDiscoverEnabledStatusError])

  useEffect(()=>{
    if(isDiscoverSuccess === true && discoverData){

      console.log("results recieved", discoverData.similarUsers)
      
      setResults([...discoverData.similarUsers])
    }
  },[isDiscoverSuccess, discoverData])

  useEffect(()=>{
    if(isDiscoverError === true && discoverError){
      setErrorDialogOpen(true);
          setErrorDialogTitle('Discover Error');
          setErrorDialogMessage(`An error occurred during getting  the similar users : ${discoverError?.data?.message}`);
    }
  },[isDiscoverError, discoverError])
  
  const handleToggle = async () => {
        try{
          const response = await toggleDiscoverEnable({isDiscoverEnabled : !enabled})
          if(response.data.success){
            setEnabled(response.data.isDiscoverEnabled);
          }

        }catch(error){
          setErrorDialogOpen(true);
          setErrorDialogTitle('Discover Error');
          setErrorDialogMessage(`An error occurred during changing the status : ${error?.data?.message}`);
        }  
    
  };

  const handleDiscoverSimilarUser = async ()=>{

    const response = await fetchDiscoverSimilarUsers();
  }

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

  return (
    <Box>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} lg={8}>
          <GlassmorphicInboxPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ marginLeft:'2rem',marginTop:'4rem', padding: '20px 10px' }}>
              <Typography variant="h4" sx={{color:'#ffffff'}}>
                Discover
              </Typography>
            </Box>
            <Box display="flex" justifyContent="flex-end" sx={{marginRight:'3rem', padding: '20px 10px' }}>
              <CustomizedSwitch switchEnabled={enabled} handleToggleSwitch={handleToggle} />
            </Box>

            <DiscoverCard  switchEnabled={enabled} isResultLoading={isDiscoverLoading} handleDiscoverSimilarUser={handleDiscoverSimilarUser} />
            {
              (results.length > 0) && <ResultsCard results={results} />
            }
            
          </GlassmorphicInboxPaper>
        </Grid>
      </Grid>

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

export default DiscoverScreen;
