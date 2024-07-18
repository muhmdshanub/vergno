import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Card, CardContent, Typography, Snackbar, Alert, Tooltip,IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useMarkAsReadMutation } from '../../slices/api_slices/notificationsApiSlice';
import { decrementUnreadCount } from '../../slices/notificationCountSlice';
import { useNavigate } from 'react-router-dom';


const NotificationCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: '10px',
  boxShadow: theme.shadows[1],
}));

const AcceptFollowRequest = ({ userData, notification }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRead, setIsRead] = useState(notification.isRead);

  const { fallbackImage } = useSelector(state => state.fallbackImage);
  const [markAsRead, { isLoading: markAsReadLoading, isSuccess: markAsReadSuccess }] = useMarkAsReadMutation();
  const [markAsReadError, setMarkAsReadError] = useState("");

  const handleMarkAsRead = async () => {
    try {
     
      await markAsRead({ notificationId: notification._id }).unwrap();
      setIsRead(true)
      dispatch(decrementUnreadCount());
      

    } catch (error) {
      setMarkAsReadError(error.message || error.data.message);
      console.error('Failed to mark notification as read:', error);
    }
  };


  const handleCloseSnackbarRead = () => {
    setMarkAsReadError("");
  };

  const handleArrowButtonClicked = async () =>{
      if (!isRead) {
        await handleMarkAsRead();
      }
      
  }

  const handleAction = () => {
    console.log(`${userData?.name} notification action`);
    // Add your logic for the follow request accepted action here
  };

  return (
    <NotificationCard sx={{backgroundColor : (isRead ? "#00000" : "#e8e8e8"), minWidth:'400px'}}>
      <Avatar alt={userData?.name} src={userData?.image?.url || userData?.googleProfilePicture || fallbackImage} sx={{ marginRight: 2 }} />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="body1">
          <strong>{userData?.name}</strong> accepted your follow request.
        </Typography>
      </CardContent>
        {(!isRead) && <Tooltip title="Mark as Read">
          <IconButton color="secondary" onClick={handleMarkAsRead} disabled={markAsReadLoading}>
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>}
      <Button variant="contained" color="primary" onClick={handleArrowButtonClicked} sx={{ minWidth: 'auto', padding: '8px' }}>
        <ArrowForwardIcon />
      </Button>

      <Snackbar open={!!markAsReadError} autoHideDuration={6000} onClose={handleCloseSnackbarRead}>
        <Alert onClose={handleCloseSnackbarRead} severity="error" sx={{ width: '100%' }}>
          {markAsReadError}
        </Alert>
      </Snackbar>
    </NotificationCard>
  );
};


AcceptFollowRequest.propTypes = {
  userData: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
};


export default AcceptFollowRequest;
