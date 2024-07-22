import React from 'react';
import { Card, Avatar, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const UserProfileCard = () => {
  const theme = useTheme();
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.userAuth); 
  const { fallbackImage } = useSelector((state) => state.fallbackImage);

  return (
    <Card sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '10px', 
      borderRadius: '10px', 
      
      maxWidth: '100%', // Ensure it doesn't overflow its parent
      overflow: 'hidden', // Hide any overflow content
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(6px) saturate(150%)',
      WebkitBackdropFilter: 'blur(6px) saturate(150%)',
      border: '1px solid rgba(209, 213, 219, 0.45)',
      boxShadow: theme.shadows[3],
      transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    }} >
      <Avatar 
        alt={userInfo.name} 
        src={userInfo.image?.url || userInfo.image || fallbackImage} 
        sx={{ width: 56, height: 56, marginRight: '16px' }} 
        onClick={ () => navigate('/profile')}
      />
      <Box sx={{ 
        flex: '1 1 auto', // Allow box to grow and shrink as needed
        minWidth: '0' // Ensure the box can shrink
      }}>
        <Typography variant="h6" component="div" style={{cursor:'pointer'}} onClick={ () => navigate('/profile')} noWrap >
          {userInfo.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" style={{cursor:'pointer'}} noWrap>
          {userInfo.email}
        </Typography>
      </Box>
    </Card>
  );
};

export default UserProfileCard;
