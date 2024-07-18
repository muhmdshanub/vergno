import React from 'react';
import { Card, CardContent, Box, Typography, Button, useTheme } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { useSelector } from 'react-redux';

const GroupsCard = () => {
  const theme = useTheme();
  const { userInfo } = useSelector((state) => state.userAuth);

  const groups = ['C learners', 'Movie goers', 'AI enthusiasts'];

  


  return (
    <Card sx={{ boxShadow: 3, borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(6px) saturate(200%)',
      WebkitBackdropFilter: 'blur(6px) saturate(200%)',
      border: '1px solid rgba(209, 213, 219, 0.6)', }}>
      <CardContent style={{ position: 'relative', paddingBottom: '60px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <GroupIcon sx={{ marginRight: '10px' }} />
          <Typography variant="h6">Groups</Typography>
        </Box>
        {groups.map((group, index) => (
          <Typography key={index} variant="body1" sx={{ marginBottom: '5px', border: '1px solid lightblue', borderRadius: '5px', padding: '5px' }}>
            {group}
          </Typography>
        ))}
        <Button style={{ backgroundColor: theme.palette.ternaryButton.main, position: 'absolute', bottom: '10px', right: '20px' }}>See More</Button>
      </CardContent>
    </Card>
  );
};

export default GroupsCard;
