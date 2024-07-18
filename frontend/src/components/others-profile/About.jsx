import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, TextField, Button, Paper } from '@mui/material';
import { styled } from '@mui/system';
import { useGetOtherUserAboutInfoForProfileQuery } from '../../slices/api_slices/profileApiSlice';
import ErrorAlertDialog from '../ErrorAlertDialoge';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.ternaryButton.main,
  width: '500px',
  margin:'auto'
}));

const InfoRow = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.secondary,
  marginRight: theme.spacing(1),
  flex: '0 0 150px',
}));

const Value = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const About = ({userId}) => {
  const { data: userProfileData, error, isLoading, refetch } = useGetOtherUserAboutInfoForProfileQuery({userId});
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

 


  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error loading profile information</Typography>;
  }

  if(userProfileData?.isUserUnavailable === true){
    return <Typography color="error">{userProfileData?.message || "User data currently unavailable."}</Typography>;
  }

  return (
    <StyledPaper>
      <Typography variant="h5" gutterBottom sx={{ marginBottom: '30px' }}>
        About
      </Typography>
      
          <InfoRow>
            <Label>Email:</Label>
            <Value>{userProfileData.email || "NIL"}</Value>
          </InfoRow>
          <InfoRow>
            <Label>Date of Birth:</Label>
            <Value>{new Date(userProfileData.dob).toLocaleDateString() || "NIL"}</Value>
          </InfoRow>
          <InfoRow>
            <Label>Gender:</Label>
            <Value>{userProfileData.gender || "NIL"}</Value>
          </InfoRow>
          <InfoRow>
            <Label>Nationality:</Label>
            <Value>{userProfileData.nationality || "NIL"}</Value>
          </InfoRow>
          <InfoRow>
            <Label>Phone:</Label>
            <Value>{userProfileData.phone || "NIL"}</Value>
          </InfoRow>
       

      <ErrorAlertDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        title="Validation Error"
        message={dialogMessage}
      />

    </StyledPaper>
  );
};


About.propTypes = {
  userId: PropTypes.string.isRequired,
};


export default About;
