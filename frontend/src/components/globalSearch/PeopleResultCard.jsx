import React from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const GlassmorphicUserCard = styled(Card)(({ theme }) => ({
  cursor:'pointer',
  minWidth: 275,
  maxHeight:'fit-content',
  marginTop: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.55)', // Semi-transparent gradient background
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: 'none', // Remove border for seamless blending
  boxShadow: 'none', // Remove box shadow for seamless blending
  borderRadius: '12px', // Slight border radius for smoother appearance
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Slightly more opaque background
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow on hover for depth
  },
}));



const PeopleResultCard = ({ name, avatarUrl,  userId }) => {

  const navigate = useNavigate()

  const handleRedirectToUserProfile = () =>{

    navigate(`/profiles/${userId}`)
}


  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={11} lg={10}>
        <GlassmorphicUserCard onClick={handleRedirectToUserProfile}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyItems="felx-start" justifyContent="flex-start" padding='0'>
              <Avatar src={avatarUrl} sx={{ width: 40, height: 40, marginRight: 4, marginLeft : 2 }} />
              <Typography variant="body1" cursor="pointer" sx={{cursor:'pointer'}}>
                  {name}
                </Typography>
                
            </Box>
          </CardContent>
        </GlassmorphicUserCard>
      </Grid>
    </Grid>
  );
};

export default PeopleResultCard;
