import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Avatar, Typography, Button, Box, Tooltip,Snackbar, Alert, IconButton, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@emotion/react';
import {  useUnblockUserMutation } from '../../slices/api_slices/peoplesApiSlice';
import { useSelector } from 'react-redux';
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



const BlockedProfileCard = ({userData, onUnblock, handleUnblockingsReduction}) => {

  const theme = useTheme();
  const navigate = useNavigate()
  const {fallbackImage} = useSelector(state => state.fallbackImage);
  
  const [unblockUser, {isLoading: unblockUserLoading, isSuccess : unblockUserSuccess }] = useUnblockUserMutation();

  const [unblockUserError, setUnblockUserError] =useState("")

  
  const truncatedName = (name ) => {
    if (typeof name !== 'string') {
      name = String(name);
    }
    return name.length > 10 ? name.slice(0, 12)  : name;
  }





  const handleCloseSnackbarUnblock = () =>{
    setUnblockUserError("")
  }

  const handleUnblockUser = async ()=>{
    
    try {
      await unblockUser({ blockedUserId: userData._id }).unwrap();
      onUnblock(userData._id)
      handleUnblockingsReduction()
      
    } catch (error) {
      setUnblockUserError(JSON.stringify(error.message || error.data.message))
      console.error('Failed to unblock user:', error);
    }
  }

  return (
    <GlassmorphicCard  elevation={6}>
     
      
      
      <CardContent >
        <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center" >
          <Box sx={{width:"85px", height:"85px", backgroundImage: theme.palette.rainbow.default, borderRadius:"50%", display:"flex"  ,alignItems:"center" ,justifyItems:"center", justifyContent:"center"}}>
            <Avatar
                alt="User Avatar"
                src={userData?.image?.url || userData?.googleProfilePicture  || fallbackImage}
                sx={{cursor : 'pointer', width: 80, height: 80, }}
            />
          </Box>
          
          <Tooltip title={userData?.name}>
            <Typography variant="h6"  sx={{cursor : 'pointer', mb: 2,mt:2, width: '100%', height: '2rem', overflow: 'hidden', display:"flex",justifyContent:"center", color:theme.palette.secondary.main,}}>
              <span>{truncatedName(userData.name)}</span>
            </Typography>
          </Tooltip>

          <Box  display="flex" flexDirection="column" alignItems="center" justifyItems="center" sx={{backgroundColor:"#000000",color:"#ffffff", width:"90%", paddingTop:"8px", paddingBottom:"8px", borderRadius:"5px", marginBottom:"2rem", height:'6rem'}} >
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

          <Tooltip title="Remove from followers">
            <Button variant="contained" style={{backgroundColor:theme.palette.danger.main, color:"#ffffff"}} onClick={handleUnblockUser}>
              Unblock
            </Button>
          </Tooltip>
          
        </Box>
      </CardContent>

      <Snackbar open={!!unblockUserError} autoHideDuration={6000} onClose={handleCloseSnackbarUnblock}>
        <Alert onClose={handleCloseSnackbarUnblock} severity="error" sx={{ width: '100%' }}>
          {unblockUserError}
        </Alert>
      </Snackbar>
    </GlassmorphicCard>
  );
};


BlockedProfileCard.propTypes = {
  userData: PropTypes.object.isRequired, // Assuming userData is an object and is required
  onUnblock: PropTypes.func.isRequired, // Function to handle unblocking a user
  handleUnblockReduction: PropTypes.func.isRequired, // Function to handle reducing the unblock action
};


export default BlockedProfileCard;
