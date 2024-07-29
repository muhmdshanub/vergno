import React from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import ResultUserCard from './ResultUserCard';
import { useSelector } from 'react-redux';

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


  

const ResultsCard = ({results}) => {

  const {fallbackImage} = useSelector((state) => state.fallbackImage)

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={11} lg={10}>
        <GlassmorphicCard>
          <AppBar position="static" color="transparent" elevation={0} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Results
              </Typography>
            </Toolbar>
          </AppBar>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Typography variant="body1" gutterBottom>
                Here are the results.
              </Typography>

              {
                results.map((result, index)=>(
                    

                      <ResultUserCard 
                        key={result.user._id || index}
                        userId={result.user._id}
                        name={result.user.name}
                        avatarUrl={result.user.image.url || result.user.googleProfilePicture || fallbackImage}
                        matches={result.user.commonTopics}
                        />
                    
                        
                    
                ))
              }
            </Box>
          </CardContent>
        </GlassmorphicCard>
      </Grid>
    </Grid>
  );
};

export default ResultsCard;
