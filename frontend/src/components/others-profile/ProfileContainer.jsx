import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Avatar, Typography, Grid, IconButton, Button,Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import { MoreVert,  } from '@mui/icons-material';
import ErrorAlertDialog from '../admin/ErrorAlertDialog.jsx';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import ProfileInfoHeaderSkeleton from '../skeletons/ProfileInfoHeader.jsx';
import { useGetOtherUserProfileCardInfoQuery } from '../../slices/api_slices/profileApiSlice.js';
import { useUnfollowMutation, useBlockUserMutation, useSendFollowRequestMutation, useUnblockUserMutation, useSendCancelRequestMutation } from '../../slices/api_slices/peoplesApiSlice';




const ProfileContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  width: '100%',
  maxWidth: '900px',
  margin: '50px',
  height: 'fit-content',
}));

const Name = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.2rem',
  marginBottom: theme.spacing(1),
}));

const Stats = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));



const Profile = ({userId}) => {

  const theme = useTheme();
  const {fallbackImage} = useSelector(state => state.fallbackImage)


  // Fetch user profile card info using query hook
  const { data: userProfileData, error: userProfileError,isSuccess: userProfileSuccess, isLoading: userProfileLoading, refetch: refetchUserProfile } = useGetOtherUserProfileCardInfoQuery({userId});
  
  const [unfollow, { isLoading, isSuccess }] = useUnfollowMutation();
  const [blockUser, {isLoading: blockUserLoading, isSuccess : blockUserSuccess }] = useBlockUserMutation();
  const [sendFollowRequest, { isLoading: followRequestLoading, isSuccess : followRequestSuccess }] = useSendFollowRequestMutation();
  const [unblockUser, {isLoading: unblockUserLoading, isSuccess : unblockUserSuccess }] = useUnblockUserMutation();
  const [sendCancelRequest, { isLoading: cancelRequestLoading, isSuccess : cancelRequestSuccess }] = useSendCancelRequestMutation();


  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleUnblockUser = async ()=>{
    
    try {
      await unblockUser({ blockedUserId: userProfileData._id }).unwrap();
      refetchUserProfile();
      
    } catch (error) {
        setErrorDialogOpen(true);
        setErrorDialogTitle('Unblock Error');
        setErrorDialogMessage('Failed to Unblock. Please try again.');
        console.error('Failed to unblock user:', error);
    }
    
    handleMenuClose();
  }


  const handleUnfollow = async () => {
    try {
      await unfollow({ followedUserId: userProfileData?._id }).unwrap();
      refetchUserProfile();
      handleMenuClose();
    } catch (error) {

    setErrorDialogOpen(true);
    setErrorDialogTitle('Unfollow Error');
    setErrorDialogMessage('Failed to Unfollow. Please try again.');
      console.error('Failed to Unfollow :', error);
    }
  };

  
  const handleFollow = async () => {
    try {
      await sendFollowRequest({ followedUserId: userProfileData._id }).unwrap();
      refetchUserProfile()
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Follow Error');
      setErrorDialogMessage('Failed to Follow. Please try again.');
      console.error('Failed to send follow request:', error);
    }

  }

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  const handleBlockUser = async ()=>{
    
    try {
      await blockUser({ blockedUserId: userProfileData._id }).unwrap();
      refetchUserProfile();
      
    } catch (error) {
        setErrorDialogOpen(true);
        setErrorDialogTitle('Block Error');
        setErrorDialogMessage('Failed to Block. Please try again.');
      console.error('Failed to block user:', error);
    }
    
    handleMenuClose();
  }

  const handleCancel = async () => {
    try {
      await sendCancelRequest({ followedUserId: userProfileData._id }).unwrap();
      refetchUserProfile();
      handleMenuClose();
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Cancel Follow request Error');
      setErrorDialogMessage('Failed to Cancel Follow request. Please try again.');
      console.error('Failed to send cancel request:', error);
    }
  };

  if(userProfileLoading){
    return (<ProfileInfoHeaderSkeleton />);
  }

  


  if(userProfileData?.isUserUnavailable === true){
    return <Typography color="error">{data?.message || "User data currently unavailable."}</Typography>;
  }

  if( userProfileSuccess && userProfileData?.isUserUnavailable !== true){
    return (
        <ProfileContainer>
          <Grid container alignItems="center" justifyContent="space-around" spacing={2}>
            <Grid item xs={12} md={5} sx={{ textAlign: 'center',  }}>
              <Box sx={{width:'fit-content', position:'relative', margin:'auto'}}>
                <Avatar src={userProfileData?.image?.url || userProfileData?.googleProfilePicture || fallbackImage} alt={userProfileData?.name} sx={{ width: '150px', height: '150px', margin:'auto', position:'relative' }}>
                
                </Avatar>
                
              </Box>
    
              
            </Grid>
            <Grid item xs={12} md={7} sx={{  justifyContent:'center'}}>
              <Box sx={{display:"flex", alignItems:'center'}}>
                  <Name sx={{position: 'relative'}}>{userProfileData?.name}</Name>
                  
              </Box>
              
              <Stats>{userProfileData?.followersCount || 0} Followers • {userProfileData?.followingCount || 0} Following</Stats>
              <Box sx={{display:'flex', alignItems:'center',}}>
                {(userProfileData?.isBlockedByCurrentUser === true) && (
    
                    <>
                        <Stats>You have blocked this user</Stats>
                        <Button onClick={handleUnblockUser}  style={{backgroundColor:'green'}}>Unblock</Button>
                    </>
                )}
    
                {(userProfileData?.isBlockedByCurrentUser === false ) && (
    
                        <>
                            
                            {(userProfileData?.pendingFollowRequestFromCurrentUser === true) && <Stats>Pending Follow request</Stats>}
                            {(userProfileData?.currentUserFollowsRequestedUser !== true && userProfileData?.pendingFollowRequestFromCurrentUser !== true) && <Button onClick={handleFollow} style={{backgroundColor:"blue"}}>Follow</Button>}
    
                            <IconButton
                                    aria-label="more"
                                    onClick={handleMenuOpen}
                                    sx={{ width: "fit-content" ,color:"#000000" }}
                                >
                                    <MoreVert />
                                </IconButton>
    
                                <Menu
                                    anchorEl={menuAnchorEl}
                                    open={Boolean(menuAnchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleBlockUser}>
                                    Block User
                                    </MenuItem>
                                    {userProfileData?.currentUserFollowsRequestedUser === true && <MenuItem onClick={handleUnfollow}>Unfollow</MenuItem>}
                                    {(userProfileData?.pendingFollowRequestFromCurrentUser === true) && (<MenuItem onClick={handleCancel}>Cancel follow request</MenuItem>)}
                                </Menu>
    
                        </>
                )}
              </Box>
            </Grid>
          </Grid>
    
          <ErrorAlertDialog
              title={errorDialogTitle}
              message={errorDialogMessage}
              open={errorDialogOpen}
              onClose={handleCloseErrorDialog}
            />
        </ProfileContainer>
      );
  }
  
}

Profile.propTypes = {
  userId: PropTypes.string.isRequired,
}

export default Profile
