import { useTheme } from '@emotion/react';
import React,{useState, useEffect} from 'react'
import { styled, Paper, Grid, Box, Button, FormControl, Select, MenuItem, Typography, Pagination , Snackbar, Alert} from '@mui/material';
import BlockedProfileCard from './BlockedProfileCard.jsx';
import { useAllBlockingsQuery } from '../../slices/api_slices/peoplesApiSlice.js';
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




const BlockedPeople = () => {
    const theme = useTheme();

    const [sortBy, setSortBy] = useState('default');
    const [page, setPage] = useState(1);
    const [blockings, setBlockings] = useState([]);
    const limit = 9;
    const [lowerLimit, setLowerLimit] = useState(limit)
    const [totalBlockingsCount, setTotalBlockingsCount] = useState(0)
    const [errorFlag, setErrorFlag] = useState(false)

    const { data: responseData, isSuccess : allBlockingsSuccess, isLoading : allBlockingsLoading,isError,error, refetch } = useAllBlockingsQuery({ page, limit: 9, sortBy }); // Call the API function
    

    
    useEffect(()=>{

      if(page == 1){
        refetch();
      }else{
        setPage(1)
      }

    }, [sortBy]);


    useEffect(() => {
      
      refetch(); // Manually trigger a refetch whenever page changes
      setLowerLimit(limit)
      
       
  }, [page]);



  useEffect(() => {

    if (allBlockingsSuccess && responseData?.userData) {
        setBlockings(responseData?.userData);
    }
    setTotalBlockingsCount (responseData?.totalCount) ;

  }, [allBlockingsSuccess, responseData]);

  useEffect(()=>{
    if(lowerLimit <= 0 && totalBlockingsCount > 0){
      setPage(prevPage => prevPage + 1)
    }
  },[lowerLimit])


    
    const handleSortByChange = (event) => {
      setSortBy(event.target.value);
    };


    const handlePageChange = (event, value) => {
      setPage(value);
    };

    const handleUnblockingsReduction = () =>{
      setTotalBlockingsCount(prevCount => prevCount-1)
      setLowerLimit(prevCount => prevCount-1)
    }
  
    const handleUnblocking = (userId) => {
      setBlockings(prevRequests => prevRequests.filter(user => user._id !== userId));
    };
  
    useEffect(()=>{
        if(isError === true){
            setErrorFlag(true)
        }
    },[isError])

   const handleCloseSnackbar =() =>{
    setErrorFlag(false);
   }

  return (
    <LoginPaper elevation={0} sx={{backgroundColor:'transparent'}} position="relative">

          <div style={{display: 'flex', justifyContent: 'space-between',alignItems:"center", marginBottom: '20px', width:"100%", marginRight:"20px"}}> 
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" style={{  padding: "10px", color: "#ffffff", width:"fit-content" }}>
                  Total Blocked [ {totalBlockingsCount} ]
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{display: 'flex', justifyContent: 'flex-end',}}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: "center", alignContent: "center" }}>
                  <Typography sx={{ color: "#ffffff" }}>Sort By : </Typography>
                  <FormControl sx={{ m: 1, minWidth: 120, backgroundColor: theme.palette.secondaryButton.main, borderRadius: '8px' }}>
                    <Select
                      value={sortBy}
                      onChange={handleSortByChange}
                      inputProps={{ 'aria-label': 'Without label' }}
                      style={{ color: theme.palette.primary.main, borderRadius: '8px' }}
                    >
                      <MenuItem value="default">Default</MenuItem>
                      <MenuItem value="latest">Latest</MenuItem>
                      <MenuItem value="old">Old</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
           
          </div>   
        <Grid container spacing={1} sx={{ width: '100%',  }}>

                {allBlockingsLoading ? (
                                Array.from(new Array(8)).map((_, index) => (
                                    <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
                                        <PeopleProfileCardSkeleton />
                                    </Grid>
                                ))
                            ) : allBlockingsSuccess && totalBlockingsCount > 0 ? (
                              blockings.map((user) => (
                                    <Grid item xs={6} sm={6} md={4} lg={3} key={user._id}>
                                        <BlockedProfileCard userData={user} onUnblock={handleUnblocking} handleUnblockingsReduction={handleUnblockingsReduction} />
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        You  blocked 0 people.
                                    </Box>
                                </Grid>
                            )}
        </Grid>

        {totalBlockingsCount > 0 && (
          <Pagination
            count={Math.ceil(totalBlockingsCount / 9)}
            page={page}
            onChange={handlePageChange}
            sx={{ position: 'absolute', bottom: '10px' }}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        )}

      <Snackbar open={!!errorFlag} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          { `Error fetching data :  ${JSON.stringify(error?.data?.message)}`}
        </Alert>
      </Snackbar>
    
    
    </LoginPaper>
  )
}

export default BlockedPeople