import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Avatar, Typography, Button, Box, Tooltip,Snackbar, Alert, IconButton, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useUnfollowMutation, useBlockUserMutation } from '../../slices/api_slices/peoplesApiSlice';
import { useSelector } from 'react-redux';
import { MoreVert, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {styled} from '@mui/material';

const GlassmorphicCard = styled(Card)(({ theme }) => ({ 
  margin: '1rem',
  borderRadius:"8px",
  padding: "10px 25px",
  position:"relative",
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
  minWidth:'200px'

}));



const FollowingProfileCard = ({userData, onUnfollow, handleUnfollowReduction}) => {

  const theme = useTheme();
  const navigate = useNavigate();
  const {fallbackImage} = useSelector(state => state.fallbackImage);
  const [unfollow, { isLoading, isSuccess }] = useUnfollowMutation();
  const [blockUser, {isLoading: blockUserLoading, isSuccess : blockUserSuccess }] = useBlockUserMutation();
  const [unfollowError, setUnfollowError] =useState("")


  const [blockUserError, setBlockUserError] =useState("")

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  
  const truncatedName = (name ) => {
    if (typeof name !== 'string') {
      name = String(name);
    }
    return name.length > 10 ? name.slice(0, 12)  : name;
  }


const handleUnfollow = async () => {
    try {
      await unfollow({ followedUserId: userData._id }).unwrap();
      
      onUnfollow(userData._id)
      handleUnfollowReduction()
      
    } catch (error) {
      setUnfollowError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to Unfollow :', error);
    }
  };


  const handleCloseSnackbar = () =>{
    setUnfollowError("")
  }
  const handleCloseSnackbarBlock = () =>{
    setBlockUserError("")
  }

  const handleBlockUser = async ()=>{
    
    try {
      await blockUser({ blockedUserId: userData._id }).unwrap();
      onUnfollow(userData._id)
      handleUnfollowReduction()
      
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
          <Box sx={{width:"85px", height:"85px", backgroundImage: theme.palette.rainbow.default, borderRadius:"50%", display:"flex"  ,alignItems:"center" ,justifyItems:"center", justifyContent:"center"}}>
            <Avatar
                alt="User Avatar"
                src={userData?.image?.url || userData?.googleProfilePicture  || fallbackImage}
                sx={{cursor : 'pointer', width: 80, height: 80, }}
                onClick={navigateToOtherUserProfile}
            />
          </Box>
          
          <Tooltip title={userData?.name}>
            <Typography onClick={navigateToOtherUserProfile} variant="h6"  sx={{cursor : 'pointer', mb: 2,mt:2, width: '100%', height: '2rem', overflow: 'hidden', display:"flex",justifyContent:"center", color:theme.palette.secondary.main,}}>
              <span>{truncatedName(userData.name)}</span>
            </Typography>
          </Tooltip>

          <Box  display="flex" flexDirection="column" alignItems="center" justifyItems="center" sx={{backgroundColor: userData.followingTopics.length > 0 ? "#000000" : 'transparent',color:"#ffffff", width:"90%", paddingTop:"8px", paddingBottom:"8px", borderRadius:"5px", marginBottom:"2rem", height:'6rem'}} >
          {
              
              userData.followingTopics.map((topic) =>(
                
                <Tooltip title={topic.name}>
                  <Typography variant="body2"  sx={{cursor : 'pointer', mb: '3px',mt:0, width: '100%', height: '1.5rem',  display:"flex",justifyContent:"center", color:'#ffffff',}} onClick={() => navigate(`/topics/${topic._id}`)}>
                    {truncatedName(topic.name)}
                  </Typography>
                </Tooltip>

              ))
            }
          </Box>

          <Tooltip title="Remove from followers">
            <Button variant="contained" style={{backgroundColor:theme.palette.danger.main, color:"#ffffff"}} onClick={handleUnfollow}>
              Unfollow
            </Button>
          </Tooltip>
          
        </Box>
      </CardContent>
      <Snackbar open={!!unfollowError} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {unfollowError}
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



FollowingProfileCard.propTypes = {
  userData: PropTypes.object.isRequired, // Assuming userData is an object and is required
  onUnfollow: PropTypes.func.isRequired, // Function to handle unfollow action
  handleUnfollowReduction: PropTypes.func.isRequired, // Function to handle reducing following count
};


export default FollowingProfileCard;
