import React from 'react';
import { Card, CardContent, Box, Typography, Button, useTheme } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';


const GlassmorphicCard = styled(Card)(({theme})=>({
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(6px) saturate(150%)',
      WebkitBackdropFilter: 'blur(6px) saturate(150%)',
      border: '1px solid rgba(209, 213, 219, 0.45)',
      boxShadow: theme.shadows[3],
      transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
}))


const TopicsCard = ({topics}) => {

    const theme = useTheme();
    const navigate = useNavigate()
    const {userInfo} = useSelector((state) => state.userAuth);


  //const topics = ['Mongolian History', 'Artificial Intelligence', 'Shakespeare'];

  return (
    <GlassmorphicCard  >
      <CardContent style={{position:'relative', paddingBottom: '60px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px', }}>
          <TagIcon sx={{ marginRight: '10px' }} />
          <Typography variant="h6">Topics</Typography>
        </Box>
        {topics.map((topic, index) => (
          <Typography key={index} variant="body1" sx={{ marginBottom: '5px',backgroundColor:'#ffffff',  borderRadius: '5px', padding: '5px', cursor:'pointer' }} onClick={()=> {navigate(`/topics/${topic._id}`)}}>
            {topic.name}
          </Typography>
        ))}
        <Button  style={{backgroundColor:'rgba(66, 54, 100, 0.7)',  position:'absolute',bottom:'10px',right:'20px' }} onClick={()=> {navigate('/topics')}}>See More</Button>
        
      </CardContent>
    </GlassmorphicCard >
  );
};

export default TopicsCard;
