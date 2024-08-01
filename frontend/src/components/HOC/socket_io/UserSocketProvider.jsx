import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation  } from 'react-router-dom';
import { incrementUnreadCount } from '../../../slices/notificationCountSlice';
import { incrementUnreadMessageCount } from '../../../slices/messageCountSlice';
import { userLogout } from '../../../slices/userAuthSlice';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Mail from '@mui/icons-material/Mail';
import { useLogoutMutation } from '../../../slices/api_slices/userApiSlice';

const UserSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.userAuth);
  const [showNotificationSnackbar, setShowNotificationSnackbar] = useState(false);
  const [notificationSnackbarMessage, setNotificationSnackbarMessage] = useState('');
  const [showMessageSnackbar, setShowMessageSnackbar] = useState(false);
  const [messageSnackbarMessage, setMessageSnackbarMessage] = useState('');

  

  useEffect(() => {
    if (userInfo?._id) {
      const socket = io(`import.meta.env.VITE_HOST_IP`);

      socket.emit('joinRoom', userInfo._id);

      socket.on('forced_logout', async () => {

        
        dispatch(userLogout());
        navigate('/');
    
        
      })

      socket.on('new_follow_request', () => {
        dispatch(incrementUnreadCount());
        setShowNotificationSnackbar(true);
        setNotificationSnackbarMessage('You have a new follow request!');
        
      });

      socket.on('follow_request_accepted', () => {
        dispatch(incrementUnreadCount());
        setShowNotificationSnackbar(true);
        setNotificationSnackbarMessage('Your follow request accepted!');

        
      });

      socket.on('new_query_like', () => {
        dispatch(incrementUnreadCount());
        setShowNotificationSnackbar(true);
        setNotificationSnackbarMessage('You have a new like on Query');
        
      })

      socket.on('new_perspective_like', () => {
        dispatch(incrementUnreadCount());
        setShowNotificationSnackbar(true);
        setNotificationSnackbarMessage('You have a new like on Perspective');
        
      })

      socket.on('new_message', () => {
        dispatch(incrementUnreadMessageCount());
        
        if (location.pathname !== '/chats') {
          
          setShowMessageSnackbar(true);
          setMessageSnackbarMessage('You have a new message');
        }
        
      })

      return () => {
        socket.disconnect();
      };
    }
  }, [dispatch, userInfo?._id]);

  const handleCloseNotificationSnackbar = () => {
    setShowNotificationSnackbar(false);
    setNotificationSnackbarMessage('');
  };

  const handleViewNotifications = () => {
    navigate('/notifications');
    handleCloseNotificationSnackbar(); // Close the snackbar after navigating
  };

  const handleCloseMessageSnackbar = () => {
    setShowMessageSnackbar(false);
    setMessageSnackbarMessage('');
  };

  const handleViewMessages = () => {
    navigate('/chats');
    handleCloseMessageSnackbar(); // Close the snackbar after navigating
  };

  return (
    <>
      {children}
      <Snackbar
        open={showNotificationSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseNotificationSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        style={{ backgroundColor: '#1976d2', color: 'white' }}
        message={notificationSnackbarMessage}
        action={
          <React.Fragment>
            <Avatar style={{ backgroundColor: '#ffe700', marginRight: '8px' }}>
              <NotificationsIcon />
            </Avatar>
            <IconButton
              size="small"
              aria-label="view"
              color="inherit"
              onClick={handleViewNotifications}
            >
              View
            </IconButton>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseNotificationSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />

      {/* message snackbar */}

      <Snackbar
        open={showMessageSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseMessageSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        style={{ backgroundColor: '#1976d2', color: 'white' }}
        message={messageSnackbarMessage}
        action={
          <React.Fragment>
            <Avatar style={{ backgroundColor: '#ffe700', marginRight: '8px' }}>
              <Mail />
            </Avatar>
            <IconButton
              size="small"
              aria-label="view"
              color="inherit"
              onClick={handleViewMessages}
            >
              View
            </IconButton>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseMessageSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
};

UserSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSocketProvider;
