import React,{useState} from 'react';
import { Card, Box, Avatar, TextField, Typography, Button, useTheme } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useSelector } from 'react-redux';
import AddPerspective from '../home/AddPerspective';

const AddPost = () => {
  const theme = useTheme();
  const { userInfo } = useSelector((state) => state.userAuth); 
  const { fallbackImage } = useSelector((state) => state.fallbackImage);

  const[addPerspectiveOpen, setAddPerspectiveOpen] = useState(false);






  const handleAddPerspectiveOpen = () => {
    setAddPerspectiveOpen(true);
  };

  const handleAddPerspectiveClose = () => {
    setAddPerspectiveOpen(false);
  };

  return (
    <Card sx={{  alignItems: 'center', padding: '10px', boxShadow: 3, borderRadius: '10px', marginBottom: '20px' }}>
      
      <Box sx={{ flexGrow: 1,display: 'flex', alignItems: 'center',justifyItems:'center',paddingTop:'10px' }}>
      
          <Avatar 
            alt={userInfo.name} 
            src={userInfo.image?.url || userInfo.image || fallbackImage} 
            sx={{ width: 56, height: 56, marginRight: '16px' ,}} 
            
          />

<Button
      onClick={handleAddPerspectiveOpen}
      fullWidth
      sx={{
        backgroundColor: theme.palette.textFieldbg.main,
        borderRadius: '25px',
        boxShadow: `inset 2px 2px ${theme.palette.buttonOutline.main}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        textTransform: 'none',
        color: theme.palette.text.primary,
        fontWeight: 'normal',
        '&:hover': {
          backgroundColor: theme.palette.textFieldbgEnhanced.main, 
        },
        
      }}
    >
      Add new perspective...
    </Button>
      
      </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
          <Button startIcon={<LightbulbIcon />} sx={{ color: 'green' }} onClick={handleAddPerspectiveOpen}>
            Perspective
          </Button>
          <AddPerspective openModal={addPerspectiveOpen} onCloseModal={handleAddPerspectiveClose}  />
        </Box>
      
    </Card>
  );
};

export default AddPost;
