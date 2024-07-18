import React from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlassmorphicCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  marginTop: theme.spacing(4),
  backgroundImage: 'linear-gradient(-45deg, rgba(255, 199, 150, 0.3) 0%, rgba(255, 107, 149, 0.3) 100%)', // Semi-transparent gradient background
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: 'none', // Remove border for seamless blending
  boxShadow: 'none', // Remove box shadow for seamless blending
  borderRadius: '12px', // Slight border radius for smoother appearance
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundImage: 'linear-gradient(-45deg, rgba(255, 199, 150, 0.4) 0%, rgba(255, 107, 149, 0.4) 100%)', // Slightly more opaque background
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow on hover for depth
  },
}));

const DiscoverCard = ({ switchEnabled, isResultLoading, handleDiscoverSimilarUser }) => {
  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={11} lg={10}>
        <GlassmorphicCard>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Typography variant="h6" gutterBottom>
                Click on the discover button to get the list of other users who follow similar topics as you
              </Typography>
              <Tooltip title={!switchEnabled ? "Please enable the switch to discover" : ""} arrow>
                <span>
                  <Button
                    onClick={()=>handleDiscoverSimilarUser()}
                    variant="contained"
                    sx={{ backgroundColor: '#F47392', color: '#ffffff', marginTop: '3rem' }}
                    disabled={!switchEnabled || isResultLoading}
                  >
                    {isResultLoading ? <CircularProgress color="inherit" size={24} /> : "Discover"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </GlassmorphicCard>
      </Grid>
    </Grid>
  );
};

export default DiscoverCard;
