import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useTheme, Button, Hidden } from '@mui/material';
import { useGlobalSearchPeopleQuery, useGlobalSearchTopicsQuery, useGlobalSearchQueriesQuery, useGlobalSearchPerspectivesQuery } from '../../slices/api_slices/globalSearchApiSlice';
import PeopleResultCard from './PeopleResultCard';
import TopicsResultCard from './TopicsResultCard';
import QueryPostCard from '../home/QueryPostCard';
import PerspectivePostCard from '../home/PerspectivePostCard';
import QueryPostCardAdminSkeleton from '../skeletons/QueryCardAdminSkeleton';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import debounce from '../../utils/debounce';


const AllResultsFeeds = ({searchBy, selectedTabValue, setSelectedTabValue}) => {
  const theme = useTheme();

  const [debouncedSearch, setDebouncedSearch] = useState(searchBy);
  const [hasMore, setHasMore] = useState(true);
  const [errorFlag, setErrorFlag] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const shouldSkip = searchBy.trim().length < 1 ;

  const { data : peoples, error : peoplesError, isLoading : isPeoplesLoading, isSuccess : isPeoplesSuccess, isError : isPeoplesError, refetch : refetchPeoples } = useGlobalSearchPeopleQuery({
    searchBy: debouncedSearch,
    pageNum : 1,
    limitNum : 10
  }, { skip: shouldSkip, });

  const { data : topics, error: topicsError, isLoading : isTopicsLoading, isSuccess : isTopicsSuccess, isError : isTopicsError, refetch : refetchTopics } = useGlobalSearchTopicsQuery({
    searchBy: debouncedSearch,
    pageNum : 1,
    limitNum : 10
  }, { skip: shouldSkip, });

  const { data : queriesData, error: queriesError, isLoading : isQueriesLoading, isSuccess : isQueriesSuccess, isError : isQueriesError, refetch : refetchQueries } = useGlobalSearchQueriesQuery({
    searchBy: debouncedSearch,
    pageNum : 1,
    limitNum : 10
  }, { skip: shouldSkip, });

  const { data : perspectivesData, error : perspectivesError, isLoading : isPerspectivesLoading, isSuccess : isPerspectivesSuccess, isError : isPerspectivesError, refetch : refetchPerspective } = useGlobalSearchPerspectivesQuery({
    searchBy: debouncedSearch,
    pageNum : 1,
    limitNum : 10
  }, { skip: shouldSkip, });

  // Debounce the search input
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(searchBy), 500);
    handler();
    return () => clearTimeout(handler);
  }, [searchBy]);

  const handleRefetch = async () => {
    if (!shouldSkip) {
      await refetchPeoples();
      await refetchTopics();
      await refetchQueries();
      await refetchPerspective();
    }
  };



  useEffect(() => {
    
    handleRefetch();
  }, [debouncedSearch]);



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
          ( (peoples &&  peoples?.users.length > 1 || (isPeoplesSuccess && !isPeoplesLoading)) && searchBy.trim().length > 0) &&(
            <Typography variant='h6' sx={{color:'#ffffff', margin:'3rem'}} > Search Results for the key word "{searchBy}" . </Typography>
          )
        }
        
        <Box sx={{  padding: '20px', marginTop:'5rem', justifyContent: 'center', minWidth: '500px', maxWidth: '500px',minHeight: '80vh', margin:'auto', backgroundColor:'rgba(255, 255, 255, 0.2)' }}>

          {(searchBy.trim().length > 0) && (
            <>
                <Box sx={{ marginBottom: '20px', minHeight: '300px',  }}>

                    <Typography variant='h6' sx={{color:'#ffffff', backgroundColor:'rgba(0,0,0, 0.45)', padding:'0.5rem'}} >Peoples</Typography>
                    {isPeoplesLoading ? (
                        <>
                        {/* <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton /> */}
                        <h1>Loading....</h1>
                        </>
                    ) :  (( isPeoplesSuccess && peoples) &&
                        (peoples?.users.map((user) => {

                            const name = user.name;
                            const avatarUrl = user?.image?.url || user?.googleProfilePicture || null;
                            const userId = user._id;
                        
                            return (<PeopleResultCard key={user._id} name={name} avatarUrl={avatarUrl} userId={userId}  />);
                        }))
                    )}

                    { (peoples && peoples?.users.length > 0 ) && (<Box display="flex" justifyContent="flex-end" sx={{marginTop:'2rem'}}>
                        <Button variant="contained" onClick={() => setSelectedTabValue(1)} sx={{marginRight:'2rem'}}>
                            Show More Peoples
                        </Button>
                    </Box>)}
                    {(peoples && peoples?.users.length ===0 ) && <Typography variant='h6' sx={{color:'#ffffff'}}>No Result.</Typography>}
                    </Box>

                    <Box sx={{ marginBottom: '20px', minHeight: '300px',  }}>

                    <Typography variant='h6' sx={{color:'#ffffff', backgroundColor:'rgba(0,0,0, 0.45)', padding:'0.5rem'}} >Topics</Typography>
                    {isTopicsLoading ? (
                        <>
                        {/* <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton /> */}
                        <h1>Loading....</h1>
                        </>
                    ) :  (( isTopicsSuccess) &&
                        (topics?.topics.map((topic) => {

                          const name = topic.name;
                          const description = topic.description;
                          const topicId = topic._id;
                      
                          return (<TopicsResultCard key={topic._id} name={name} description={description} topicId={topicId}  />);

                        }))
                    )}

                    { (topics && topics?.topics.length > 0 ) && (<Box display="flex" justifyContent="flex-end" sx={{marginTop:'2rem'}}>
                        <Button variant="contained" onClick={() => setSelectedTabValue(2)} sx={{marginRight:'2rem'}}>
                            Show More Topics
                        </Button>
                    </Box>)}
                    {(topics && topics?.topics.length ===0 ) && <Typography variant='h6' sx={{color:'#ffffff'}}>No Topics Result.</Typography>}
                    </Box>

                    <Box sx={{ marginBottom: '20px', minHeight: '300px',  }}>

                    <Typography variant='h6' sx={{color:'#ffffff', backgroundColor:'rgba(0,0,0, 0.45)', padding:'0.5rem'}} >Queries</Typography>
                    {isQueriesLoading ? (
                        <>
                        {/* <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton /> */}
                        <h1>Loading....</h1>
                        </>
                    ) :  (( isQueriesSuccess) &&
                        (queriesData?.queries.map((post) => {

                          
                            if (post.post_type === 'queries') {
                                return <QueryPostCard key={post._id} post={post} setErrorFlag={setErrorFlag} />;
                            }
                            return null;
                            

                        }))
                    )}

                    { (queriesData && queriesData?.queries.length > 0 ) && (<Box display="flex" justifyContent="flex-end" sx={{marginTop:'2rem'}}>
                        <Button variant="contained" onClick={() => setSelectedTabValue(3)} sx={{marginRight:'2rem'}}>
                            Show More Queries
                        </Button>
                    </Box>)}
                    {(queriesData && queriesData?.queries.length ===0 ) && <Typography variant='h6' sx={{color:'#ffffff'}}>No Queries Result.</Typography>}
                    </Box>

                            <Box sx={{ marginBottom: '20px', minHeight: '300px',  }}>

                    <Typography variant='h6' sx={{color:'#ffffff', backgroundColor:'rgba(0,0,0, 0.45)', padding:'0.5rem'}} >Perspectives</Typography>
                    {isPerspectivesLoading ? (
                        <>
                        {/* <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton />
                        <QueryPostCardAdminSkeleton /> */}
                        <h1>Loading....</h1>
                        </>
                    ) :  (( isPerspectivesSuccess) &&
                        (perspectivesData?.perspectives.map((post) => {

                          
                            if (post.post_type === 'perspectives') {
                                return <QueryPostCard key={post._id} post={post} setErrorFlag={setErrorFlag} />;
                            }
                            return null;
                            

                        }))
                    )}

                    { (perspectivesData && perspectivesData?.perspectives.length > 0 ) && (<Box display="flex" justifyContent="flex-end" sx={{marginTop:'2rem'}}>
                        <Button variant="contained" onClick={() => setSelectedTabValue(4)} sx={{marginRight:'2rem'}}>
                            Show More Perspectives
                        </Button>
                    </Box>)}
                    {(perspectivesData && perspectivesData?.perspectives.length ===0 ) && <Typography variant='h6' sx={{color:'#ffffff'}}>No Perspectives Result.</Typography>}
                    </Box>
            
            </>
          ) }


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


AllResultsFeeds.propTypes = {
  searchBy: PropTypes.string,
  selectedTabValue : PropTypes.number.isRequired,
}


export default AllResultsFeeds;
