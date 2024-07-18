import React from 'react';
import { Card, CardContent, Box, Typography, Button, useTheme } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
const TopicsCard = ({topics}) => {

    const theme = useTheme();
    const navigate = useNavigate()
    const {userInfo} = useSelector((state) => state.userAuth);


  //const topics = ['Mongolian History', 'Artificial Intelligence', 'Shakespeare'];

  return (
    <Card sx={{ boxShadow: 3, borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(6px) saturate(200%)',
      WebkitBackdropFilter: 'blur(6px) saturate(200%)',
      border: '1px solid rgba(209, 213, 219, 0.6)', }}>
      <CardContent style={{position:'relative', paddingBottom: '60px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px', }}>
          <TagIcon sx={{ marginRight: '10px' }} />
          <Typography variant="h6">Topics</Typography>
        </Box>
        {topics.map((topic, index) => (
          <Typography key={index} variant="body1" sx={{ marginBottom: '5px', border: '1px solid lightblue', borderRadius: '5px', padding: '5px', cursor:'pointer' }} onClick={()=> {navigate(`/topics/${topic._id}`)}}>
            {topic.name}
          </Typography>
        ))}
        <Button  style={{backgroundColor:theme.palette.ternaryButton.main,  position:'absolute',bottom:'10px',right:'20px' }} onClick={()=> {navigate('/topics')}}>See More</Button>
        
      </CardContent>
    </Card>
  );
};

export default TopicsCard;
