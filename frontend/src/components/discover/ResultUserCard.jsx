import React from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const GlassmorphicUserCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  marginTop: theme.spacing(4),
  backgroundColor: 'rgba(0, 0, 0, 0.25)', // Semi-transparent gradient background
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: 'none', // Remove border for seamless blending
  boxShadow: 'none', // Remove box shadow for seamless blending
  borderRadius: '12px', // Slight border radius for smoother appearance
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(0,0,0, 0.45)', // Slightly more opaque background
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow on hover for depth
  },
}));



const ResultUserCard = ({ name, avatarUrl, matches, userId }) => {

  const navigate = useNavigate()

  const handleRedirectToUserProfile = () =>{

    navigate(`/profiles/${userId}`)
}


  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={11} lg={10}>
        <GlassmorphicUserCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyItems="space-between" justifyContent="space-around">
              <Avatar src={avatarUrl} sx={{ width: 56, height: 56, marginRight: 2 }} />
              <Typography variant="h6" cursor="pointer" sx={{cursor:'pointer'}}>
                  {name}
                </Typography>
                <Typography variant="body2" color="textSecondary" cursor="pointer" sx={{cursor:'pointer'}}>
                  {matches} topics match
                </Typography>
              
              <Button variant="contained" color="success" onClick={handleRedirectToUserProfile}>
                View Profile
              </Button>
            </Box>
          </CardContent>
        </GlassmorphicUserCard>
      </Grid>
    </Grid>
  );
};

export default ResultUserCard;
