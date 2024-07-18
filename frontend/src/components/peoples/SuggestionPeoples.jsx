import { useTheme } from '@emotion/react';
import React,{useState, useEffect} from 'react'
import { Skeleton, styled, Paper, Grid, Box, Button } from '@mui/material';
import PeopleProfileCard from './PeopleProfileCard.jsx';
import { useSuggestionsQuery } from '../../slices/api_slices/peoplesApiSlice.js';
import PeopleProfileCardSkeleton from '../skeletons/PeopleProfileCardSkeleton.jsx';

const LoginPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    paddingBottom:"70px",
    width: '100%',
    minWidth:'fit-content',
    position:"relative"
    
  }));


 

const SuggestionPeoples = () => {
    const theme = useTheme();
    

    const [pageNum, setPageNum] = useState(1); // State to manage pageNum
    const [suggestions, setSuggestions] = useState([]);
    const { data: peoplesData, isSuccess : suggestionsSuccess, isLoading : suggestionsLoading, refetch } = useSuggestionsQuery({ pageNum, limit: 9 }); // Call the API function

    useEffect(() => {
      
      refetch(); // Manually trigger a refetch whenever pageNum changes
       
  }, [pageNum]);

  useEffect(() => {
    if (suggestionsSuccess && peoplesData?.data) {
        setSuggestions(peoplesData?.data);
        
    }

    
  }, [suggestionsSuccess, peoplesData]);


  const handleSuggestionClear = (userId) => {
    setSuggestions(prevRequests => prevRequests.filter(user => user._id !== userId));
  };

    const handleShowMore = () => {
      setPageNum(prevPageNum => prevPageNum + 1); // Increment pageNum when 'Show More' button is clicked
    };



  return (
    <LoginPaper  elevation={0} sx={{backgroundColor:'transparent'}}>
        <Grid container spacing={1} sx={{ width: '100%' }}>

            {suggestionsLoading ? (
                                Array.from(new Array(8)).map((_, index) => (
                                    
                                        <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
                                            <PeopleProfileCardSkeleton />
                                        </Grid>
                                    
                                ))
                            ) : suggestionsSuccess && peoplesData?.data?.length > 0 ? (
                                suggestions.map((user) => (
                                    <Grid item xs={6} sm={4} md={3} lg={3} key={user._id}>
                                        <PeopleProfileCard userData={user} onSuggestionClear={handleSuggestionClear} />
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        No more suggestions for you now.
                                    </Box>
                                </Grid>
                            )}


        </Grid>

        <Button
            sx={{ 
                backgroundColor: theme.palette.secondaryButton.main, 
                position: "absolute", 
                right: "25px", 
                bottom: "10px",
                '&:hover': {
                    backgroundColor: theme.palette.secondaryButtonEnhanced.main, // Set your desired hover background color here
                }
            }}
            onClick={handleShowMore}
            disabled={suggestionsLoading || peoplesData?.data?.length <= 0}
        >
            Show More
        </Button>
    
    </LoginPaper>
  )
}

export default SuggestionPeoples