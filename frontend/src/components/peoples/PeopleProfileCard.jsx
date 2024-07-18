import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Avatar, Typography, Button, Box, Tooltip , Snackbar, Alert, IconButton, Menu, MenuItem} from '@mui/material';
import { useTheme } from '@emotion/react';
import { useSendFollowRequestMutation, useSendCancelRequestMutation, useBlockUserMutation } from '../../slices/api_slices/peoplesApiSlice';
import { useSelector } from 'react-redux';
import { Close, MoreVert } from '@mui/icons-material';
import GradientCircularProgress from '../GradientCircularProgress';
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



const PeopleProfileCard = ({userData, onSuggestionClear}) => {

  const theme = useTheme();
  const navigate = useNavigate() ;
  const [toggleSwitch, setToggleSwitch] = useState("follow");

  const [sendFollowRequest, { isLoading: followRequestLoading, isSuccess : followRequestSuccess }] = useSendFollowRequestMutation();
  const [sendCancelRequest, { isLoading: cancelRequestLoading, isSuccess : cancelRequestSuccess }] = useSendCancelRequestMutation();
  const [blockUser, {isLoading: blockUserLoading, isSuccess : blockUserSuccess }] = useBlockUserMutation();


  const {fallbackImage} = useSelector(state => state.fallbackImage)

  const [followRequestError, setFollowRequestError] =useState("")
  const [cancelRequestError, setCancelRequestError] =useState("")
  const [blockUserError, setBlockUserError] =useState("")

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleFollow = async () => {
    try {
      await sendFollowRequest({ followedUserId: userData._id }).unwrap();
      setToggleSwitch("cancel")
    } catch (error) {
      setFollowRequestError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to send follow request:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await sendCancelRequest({ followedUserId: userData._id }).unwrap();
      setToggleSwitch("follow")
    } catch (error) {
      setCancelRequestError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to send cancel request:', error);
    }
  };

  const handleCloseSnackbarFollow = () =>{
    setFollowRequestError("")
  }

  const handleCloseSnackbarCancel = () =>{
    setCancelRequestError("")
  }

  const handleCloseSnackbarBlock = () =>{
    setBlockUserError("")
  }

  const truncatedName = (name ) => {
    if (typeof name !== 'string') {
      name = String(name);
    }
    return name.length > 10 ? name.slice(0, 12)  : name;
  }


  const handleBlockUser = async ()=>{
    
    try {
      await blockUser({ blockedUserId: userData._id }).unwrap();
      onSuggestionClear(userData._id)
      
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
    <GlassmorphicCard elevation={6}>
        

      <IconButton aria-label="close" onClick={() => onSuggestionClear(userData._id)} sx={{position : "absolute", top:"10px", right:"10px", width:"fit-content"}}>
          <Close />
      </IconButton>

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
          <Box sx={{width:"85px", height:"85px", backgroundImage: theme.palette.rainbow.default, borderRadius:"50%", display:"flex"  ,alignItems:"center" ,justifyItems:"center", justifyContent:"center"}}>
            <Avatar
                alt="User Avatar"
                src={userData?.image?.url|| userData?.googleProfilePicture  || fallbackImage}
                sx={{cursor : 'pointer', width: 80, height: 80, }}
                onClick={navigateToOtherUserProfile}
            />
          </Box>
          
          
          <Tooltip title={userData.name}>
            <Typography variant="h6" sx={{cursor : 'pointer', mb: 2,mt:2, width: '100%', height: '2rem', overflow: 'hidden', display:"flex",justifyContent:"center", color:theme.palette.secondary.main,}} onClick={navigateToOtherUserProfile}>
              <span>{truncatedName(userData.name)}</span>
            </Typography>
          </Tooltip>

          <Box  display="flex" flexDirection="column" alignItems="center" justifyItems="center" sx={{backgroundColor:"#000000",color:"#ffffff", width:"90%", paddingTop:"8px", paddingBottom:"8px", borderRadius:"5px", marginBottom:"2rem", height:'6rem'}} >
            
            {
              
              userData.followingTopics.map((topic) =>(
               
                <Tooltip title={topic.topicDetails.name} key={topic._id}>
                  <Typography variant="type2"  sx={{cursor : 'pointer', mb: '3px',mt:0, width: '100%', height: '1.5rem',  display:"flex",justifyContent:"center", color:'#ffffff',}} onClick={() => navigate(`/topics/${topic.topicDetails._id}`)}>
                    {truncatedName(topic.topicDetails.name)}
                  </Typography>
                </Tooltip>

              ))
              

            }
          </Box>
          
          { (toggleSwitch === "follow") ? (
            <Button variant="contained" color="info" onClick={handleFollow} disabled={followRequestLoading}>
              {followRequestLoading ? <GradientCircularProgress /> : 'Follow'}
            </Button>

            ) : (
              <Button variant="contained" color="danger" onClick={handleCancel} disabled={cancelRequestLoading}>
              {cancelRequestLoading ? <GradientCircularProgress /> : 'Cancel'}
            </Button>
            )
          }

          


        </Box>
      </CardContent>

      <Snackbar open={!!followRequestError} autoHideDuration={6000} onClose={handleCloseSnackbarFollow}>
        <Alert onClose={handleCloseSnackbarFollow} severity="error" sx={{ width: '100%' }}>
          {followRequestError}
        </Alert>
      </Snackbar>
      <Snackbar open={!!cancelRequestError} autoHideDuration={6000} onClose={handleCloseSnackbarCancel}>
        <Alert onClose={handleCloseSnackbarCancel} severity="error" sx={{ width: '100%' }}>
          {cancelRequestError}
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


PeopleProfileCard.propTypes = {
  userData: PropTypes.object.isRequired, // Assuming userData is an object and is required
  onSuggestionClear: PropTypes.func.isRequired, // Function to handle clearing suggestion
};


export default PeopleProfileCard;
