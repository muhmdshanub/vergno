import React,{useState, useEffect} from 'react';
import { Grid, Box, Typography, Snackbar, Alert, Pagination } from '@mui/material';
import AcceptFollowRequest from '../components/notifications/AcceptFollowRequest';
import FollowRequestNotification from '../components/notifications/FollowRequestNotification';
import QueryLikedNotification from '../components/notifications/QueryLikedNotification';
import PerspectiveLikedNotification from '../components/notifications/PersPectiveLikedNotification';
import { useAllNotificationsQuery } from '../slices/api_slices/notificationsApiSlice';
import { useDispatch } from 'react-redux';
import NotificationsCardSkeleton from '../components/skeletons/NotificationsCardSkeleton';


const NotificationsScreen = () => {



  const [page, setPage] = useState(1);
  const limit = 20;
  const [errorFlag, setErrorFlag] = useState(false)
  const { data: responseData , isSuccess,  isLoading  ,isError, error, refetch } = useAllNotificationsQuery({ page, limit: 20 }); // Call the API function


  
  useEffect(() => {
      
    refetch();   
     
  }, [page]);

  useEffect(()=>{
    if(isError === true){
      setErrorFlag(true)
    }
    
  },[isError])

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCloseSnackbar =() =>{
    setErrorFlag(false);
   }

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} lg={8}>
          <Box sx={{display:"flex", alignItems:"center", justifyItems:"space-between", justifyContent:"space-between"}}>
            <Typography variant="h5" component="div" sx={{ margin: "20px 10px" }}>Notifications</Typography>
          </Box>
          <Box>
          {isLoading ? (
                                Array.from(new Array(8)).map((_, index) => (
                                    
                                        <NotificationsCardSkeleton />
                                ))
                            ) : isSuccess && responseData?.totalCount > 0 ? (
                              responseData?.notifications.map((notification) => {
                                const { type, metadata } = notification;
                                
                                if(type === "follow_request"){
                                    return <FollowRequestNotification key={notification._id} userData={{...metadata?.requester}}  notification={{_id: notification._id, isRead: notification.read}}  />
                                } 
                                if(type === "follow_request_accepted"){
                                  return <AcceptFollowRequest key={notification._id} userData={{...metadata?.accepter}} notification={{_id: notification._id, isRead: notification.read}} />
                                } 
                                if(type === "query_like"){
                                  return <QueryLikedNotification key={notification._id} userData={{...metadata?.liker}} notification={{_id: notification._id, isRead: notification.read}} queryData={{...metadata?.query}}  />
                                }
                                if(type === "perspective_like"){
                                  return <PerspectiveLikedNotification key={notification._id} userData={{...metadata?.liker}} notification={{_id: notification._id, isRead: notification.read}} perspectiveData={{...metadata?.perspective}}  />
                                }
                            })
                            ) : (
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        You have 0 Notifications.
                                    </Box>
                                </Grid>
                            )}
          </Box>
        </Grid>
      </Grid>

      {responseData?.totalCount > 0 && (
        <Grid item xs={12} sx={{display:'flex', justifyContent:'flex-end'}}>
          <Pagination
            count={Math.ceil(responseData?.totalNotificationsCount / limit)}
            page={page}
            onChange={handlePageChange}
            sx={{ position: 'absolute', bottom: '10px' }}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </Grid>
        )}

      <Snackbar open={!!errorFlag} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          { `Error fetching data :  ${JSON.stringify(error?.data?.message)}`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsScreen;
