import React,{useState} from 'react';
import { Card, Box, Avatar, TextField, Typography, Button, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { useSelector } from 'react-redux';
import AddQuery from '../home/AddQuery';


const GlassmorphicCard = styled(Card)(({theme})=>({
  
  alignItems: 'center',
  padding: '10px', boxShadow: 3,
  borderRadius: '10px',
  marginBottom: '20px',
  backgroundColor: 'rgba(255,255,255, 0.45)',
  backdropFilter: 'blur(8px) saturate(180%)',
  WebkitBackdropFilter: 'blur(8px) saturate(180%)',
  border: '1px solid rgba(209, 213, 219, 0.55)',
}))


const AddPost = () => {
  const theme = useTheme();
  const { userInfo } = useSelector((state) => state.userAuth); 
  const { fallbackImage } = useSelector((state) => state.fallbackImage);

  const[addQueryOpen, setAddQueryOpen] = useState(false);


  const handleAddQueryOpen = () => {
    setAddQueryOpen(true);
  };

  const handleAddQueryClose = () => {
    setAddQueryOpen(false);
  };

  return (
    <GlassmorphicCard sx={{  alignItems: 'center', padding: '10px', boxShadow: 3, borderRadius: '10px', marginBottom: '20px' }}>
      
      <Box sx={{ flexGrow: 1,display: 'flex', alignItems: 'center',justifyItems:'center',paddingTop:'10px' }}>
      
          <Avatar 
            alt={userInfo.name} 
            src={userInfo.image?.url || userInfo.image || fallbackImage} 
            sx={{ width: 56, height: 56, marginRight: '16px' ,}} 
            
          />

<Button
      onClick={handleAddQueryOpen}
      fullWidth
      sx={{
        backgroundColor: 'rgba(237,237,237, 0.75)',
        borderRadius: '25px',
        boxShadow: `inset 0.5px 0.5px ${theme.palette.secondary.main}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        textTransform: 'none',
        color: theme.palette.text.primary,
        fontWeight: 'normal',
        '&:hover': {
          backgroundColor: 'rgba(237,237,237, 1)', 
        },
        
      }}
    >
      Add new Query...
    </Button>
      
      </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
          <Button startIcon={<QuestionMarkIcon />} sx={{ color: 'rgba(100, 0, 0, 0.8)' }} onClick={handleAddQueryOpen}>
            Query
          </Button>
          <AddQuery openModal={addQueryOpen} onCloseModal={handleAddQueryClose}  />
        </Box>
      
    </GlassmorphicCard>
  );
};

export default AddPost;
