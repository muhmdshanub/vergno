import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const GlassmorphicTopicCard = styled(Card)(({ theme }) => ({
  cursor:'pointer',
  minWidth: 275,
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
    boxShadow: '0 4px 8px rgba(255, 255, 255,  0.5)', // Subtle shadow on hover for depth
  },
}));

const TopicResultCard = ({ name, description, topicId }) => {
  const navigate = useNavigate();

  const handleRedirectToTopic = () => {
    navigate(`/topics/${topicId}`);
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={11} lg={10}>
        <GlassmorphicTopicCard onClick={handleRedirectToTopic}>
          <CardContent>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </CardContent>
        </GlassmorphicTopicCard>
      </Grid>
    </Grid>
  );
};

export default TopicResultCard;
