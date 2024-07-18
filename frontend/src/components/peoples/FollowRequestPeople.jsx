import { useTheme } from '@emotion/react';
import React,{useState, useEffect} from 'react'
import { styled, Paper, Grid, Box, Button, FormControl, Select, MenuItem, Typography, Pagination } from '@mui/material';
import FollowRequestProfileCard from './FollowRequestProfileCard.jsx';
import { useReceivedFollowRequestsQuery } from '../../slices/api_slices/peoplesApiSlice.js';
import PeopleProfileCardSkeleton from '../skeletons/PeopleProfileCardSkeleton.jsx';

const LoginPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    paddingBottom:"70px",
    width: '100%',
    borderRadius: '10px',
    minWidth:'fit-content',
    position:"relative"
    
  }));


 

const FollowRequestPeople = () => {
    const theme = useTheme();

    const [page, setPage] = useState(1);
    const [followRequests, setFollowRequests] = useState([]);
    const limit = 9;
    const [totalRequestCount, setTotalRequestCount] = useState(0)
    const { data: responseData, isSuccess : receivedRequestsSuccess, isLoading : receivedRequestsLoading, refetch } = useReceivedFollowRequestsQuery({ page, limit: 9 }); // Call the API function


    useEffect(() => {
      
      refetch(); // Manually trigger a refetch whenever pageNum changes
       
  }, [page]);

  useEffect(() => {

    if (receivedRequestsSuccess && responseData?.userData) {
        setFollowRequests(responseData.userData);
    }

    setTotalRequestCount (responseData?.totalCount) ;
  }, [receivedRequestsSuccess, responseData]);

  const handleRequestreduction = () =>{
    setTotalRequestCount(prevCount => prevCount-1)
  }

  const handleRequestUpdate = (userId) => {
    setFollowRequests(prevRequests => prevRequests.filter(user => user._id !== userId));
  };
  
    

    const handlePageChange = (event, value) => {
      setPage(value);
    };
    
    

  return (
    <LoginPaper elevation={0} sx={{backgroundColor:'transparent'}} position="relative">

          <div style={{display: 'flex', justifyContent: 'flex-start',alignItems:"center", marginBottom: '20px', width:"100%", marginRight:"20px",}}> 
          
            <Typography variant="h5" style={{backgroundColor:"#fc03a1", padding:"10px", color:"#ffffff"}}>Total Requests [ { totalRequestCount} ]</Typography> 
          </div>   
        <Grid container spacing={1} sx={{ width: '100%',  }}>

               

                          {receivedRequestsLoading ? (
                                Array.from(new Array(8)).map((_, index) => (
                                    <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
                                        <PeopleProfileCardSkeleton />
                                    </Grid>
                                ))
                            ) : receivedRequestsSuccess && responseData?.userData?.length > 0 ? (
                              followRequests.map((user) => (
                                    <Grid item xs={6} sm={6} md={4} lg={3} key={user._id}>
                                        <FollowRequestProfileCard userData={user} onRequestUpdate={handleRequestUpdate} handleRequestreduction={handleRequestreduction} />
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        You have 0 friend Request.
                                    </Box>
                                </Grid>
                            )}
        </Grid>

        <Pagination
            count={Math.ceil(totalRequestCount / limit)}
            page={page}
            onChange={handlePageChange}
            sx={{ position: 'absolute', bottom: '10px' }}
            variant="outlined" shape="rounded"
            color="primary"
        />
    
    
    </LoginPaper>
  )
}

export default FollowRequestPeople