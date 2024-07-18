import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Avatar, Typography, Button, Box, Tooltip , Snackbar, Alert, Menu, MenuItem,  IconButton } from '@mui/material';
import { useTheme } from '@emotion/react';
import { MoreVert, } from '@mui/icons-material';
import { useDeclineReceivedRequestMutation, useAcceptReceivedRequestMutation, useBlockUserMutation } from '../../slices/api_slices/peoplesApiSlice';
import { useNavigate } from 'react-router-dom';
import {styled} from '@mui/material';

const GlassmorphicCard = styled(Card)(({ theme }) => ({ 
  margin: 5,
  borderRadius:"8px",
  padding: "10px 25px",
  position:"relative",
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  }

}));

const FollowRequestProfileCard = ({userData, onRequestUpdate, handleRequestreduction,}) => {

  

  const theme = useTheme();
  const navigate = useNavigate();
  const [declineReceivedRequest, { isLoading: declineRequestLoading, isSuccess : declineRequestSuccess }] = useDeclineReceivedRequestMutation();
  const [acceptReceivedRequest,{isLoading: acceptRequestLoading, isSuccess : acceptRequestSuccess}] = useAcceptReceivedRequestMutation();
  const [acceptRequestError, setAcceptRequestError] =useState("")
  const [declineRequestError, setDeclineRequestError] =useState("")
  const [blockUser, {isLoading: blockUserLoading, isSuccess : blockUserSuccess }] = useBlockUserMutation();

  const [blockUserError, setBlockUserError] =useState("")

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAccept = async () => {
    try {
       await acceptReceivedRequest({ followingUserId: userData._id }).unwrap();
       onRequestUpdate(userData._id); // Update the parent component's state
       handleRequestreduction();
      
    } catch (error) {
      setAcceptRequestError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to accept follow request:', error);
    }
  };

  const handleDecline = async () => {
    try {
      await declineReceivedRequest({ followingUserId: userData._id }).unwrap();
      onRequestUpdate(userData._id); // Update the parent component's state
      handleRequestreduction();
      
    } catch (error) {
      setDeclineRequestError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to send cancel request:', error);
    }
  };


  const handleCloseSnackbarAccept = () =>{
    setAcceptRequestError("")
  }

  const handleCloseSnackbarDecline = () =>{
    setDeclineRequestError("")
  }

  const handleCloseSnackbarBlock = () =>{
    setBlockUserError("")
  }

  const truncatedName = (name ) => {
    return name.length > 10 ? name.slice(0, 10)  : name;
  }

  const handleBlockUser = async ()=>{
    
    try {
      await blockUser({ blockedUserId: userData._id }).unwrap();
      onRequestUpdate(userData._id); // Update the parent component's state
      handleRequestreduction();
      
    } catch (error) {
      setBlockUserError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to block user:', error);
    }
    
    handleMenuClose();
  }

  const navigateToOtherUserProfile=() =>{
    navigate(`/profiles/${userData._id}`)
  }

  return (
    <GlassmorphicCard  elevation={6}>
      
      
      <IconButton
        aria-label="more"
        onClick={handleMenuOpen}
        sx={{ position: "absolute", top: "10px", left: "10px", width: "fit-content" }}
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
      </Menu>
      
      <CardContent >
        <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center" >
          <Box sx={{ width: "85px", height: "85px", backgroundImage: theme.palette.rainbow.default, borderRadius: "50%", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
            <Avatar
              alt="User Avatar"
              src={userData?.image?.url || userData?.googleProfilePicture || "/static/images/avatar/1.jpg"}
              sx={{ width: 80, height: 80,cursor : 'pointer' }}
              onClick={navigateToOtherUserProfile}
            />
          </Box>

          <Tooltip title={userData.name}>
            <Typography onClick={navigateToOtherUserProfile} variant="h6"  sx={{  mb: 2,mt:2, width: '100%', height: '2rem', overflow: 'hidden', display:"flex",justifyContent:"center", color:theme.palette.secondary.main, cursor : 'pointer'}}>
              <span>{truncatedName(userData.name)}</span>
            </Typography>
          </Tooltip>

          <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center" sx={{ backgroundColor:"#000000",color:"#ffffff", width: "90%", padding: "8px", borderRadius: "5px", marginBottom: "2rem", height:'6rem' }} >

            {
              
              userData.followingTopics.map((topic) =>(
                
                <Tooltip title={topic.name}>
                  <Typography variant="type2"  sx={{cursor : 'pointer', mb: '3px',mt:0, width: '100%', height: '1.5rem',  display:"flex",justifyContent:"center", color:'#ffffff',}} onClick={() => navigate(`/topics/${topic._id}`)}>
                    {truncatedName(topic.name)}
                  </Typography>
                </Tooltip>

              ))
            }
          </Box>

          <Button variant="contained" style={{ backgroundColor: theme.palette.submitButton.main, color: "#ffffff" }} onClick={handleAccept}>
            Accept
          </Button>
          <Button variant="contained" style={{ backgroundColor: theme.palette.danger.main, color: "#ffffff", marginTop: "10px" }} onClick={handleDecline}>
            Decline
          </Button>
        </Box>
      </CardContent>

      <Snackbar open={!!acceptRequestError} autoHideDuration={6000} onClose={handleCloseSnackbarAccept}>
        <Alert onClose={handleCloseSnackbarAccept} severity="error" sx={{ width: '100%' }}>
          {acceptRequestError}
        </Alert>
      </Snackbar>
      <Snackbar open={!!declineRequestError} autoHideDuration={6000} onClose={handleCloseSnackbarDecline}>
        <Alert onClose={handleCloseSnackbarDecline} severity="error" sx={{ width: '100%' }}>
          {declineRequestError}
        </Alert>
      </Snackbar>
      <Snackbar open={!!blockUserError} autoHideDuration={6000} onClose={handleCloseSnackbarBlock}>
        <Alert onClose={handleCloseSnackbarBlock} severity="error" sx={{ width: '100%' }}>
          {blockUserError}
        </Alert>
      </Snackbar>

    </GlassmorphicCard>
  );
};


FollowRequestProfileCard.propTypes = {
  userData: PropTypes.object.isRequired, // Assuming userData is an object and is required
  onRequestUpdate: PropTypes.func.isRequired, // Function to handle request update
  handleRequestReduction: PropTypes.func.isRequired, // Function to handle reducing request count
};


export default FollowRequestProfileCard;
