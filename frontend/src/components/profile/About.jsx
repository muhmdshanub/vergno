



import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, TextField, Button, Paper } from '@mui/material';
import { styled } from '@mui/system';
import { useGetUserAboutInfoForProfileQuery, useUpdateUserAboutInfoMutation } from '../../slices/api_slices/profileApiSlice';
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

const About = () => {
  const { data: userProfileData, error, isLoading, refetch } = useGetUserAboutInfoForProfileQuery();
  const [updateUserAboutInfo] = useUpdateUserAboutInfoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    dob: '',
    gender: '',
    nationality: '',
    phone: ''
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    if (userProfileData) {
      setFormData({
        email: userProfileData.email || '',
        dob: userProfileData.dob ? new Date(userProfileData.dob).toLocaleDateString('en-CA') : '',
        gender: userProfileData.gender || '',
        nationality: userProfileData.nationality || '',
        phone: userProfileData.phone || ''
      });
    }
  }, [userProfileData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      email: userProfileData.email || '',
      dob: userProfileData.dob ? new Date(userProfileData.dob).toLocaleDateString('en-CA') : '',
      gender: userProfileData.gender || '',
      nationality: userProfileData.nationality || '',
      phone: userProfileData.phone || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDate = (date) => {
    return !isNaN(Date.parse(date));
  };

  const validateGender = (gender) => {
    const validGenders = ['male', 'female', 'other'];
    return validGenders.includes(gender.toLowerCase());
  };

  const validateForm = () => {
    let validationErrors = '';

    if (!validateEmail(formData.email)) {
      validationErrors += 'Invalid email format. ';
    }

    if (!validateDate(formData.dob)) {
      validationErrors += 'Invalid date of birth. ';
    }

    if (!validateGender(formData.gender)) {
      validationErrors += 'Gender should be male, female, or other. ';
    }

    if (formData.phone && formData.phone.trim().length !== 10) {
      validationErrors += 'Phone number should have 10 numbers if provided. ';
    }

    if (formData.nationality && formData.nationality.trim().length < 2) {
      validationErrors += 'Nationality should have more than one character if provided. ';
    }

    return validationErrors;
  };



  const handleUpdateClick = async () => {

    const validationErrors = validateForm();

    if (validationErrors) {
      setDialogMessage(validationErrors);
      setDialogOpen(true);
      return;
    }



    try {
      await updateUserAboutInfo(formData);
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error updating profile information:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error loading profile information</Typography>;
  }



  return (
    <StyledPaper>
      <Typography variant="h5" gutterBottom sx={{ marginBottom: '30px' }}>
        About
      </Typography>
      {isEditing ? (
        <>
          <InfoRow>
            <Label>Email:</Label>
            <TextField
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
          </InfoRow>
          <InfoRow>
            <Label>Date of Birth:</Label>
            <TextField
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleInputChange}
              fullWidth
            />
          </InfoRow>
          <InfoRow>
            <Label>Gender:</Label>
            <TextField
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              fullWidth
            />
          </InfoRow>
          <InfoRow>
            <Label>Nationality:</Label>
            <TextField
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              fullWidth
            />
          </InfoRow>
          <InfoRow>
            <Label>Phone:</Label>
            <TextField
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />
          </InfoRow>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleUpdateClick}>
              Update
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
              Cancel
            </Button>
          </Box>
        </>
      ) : (
        <>
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
          <Button variant="contained" color="primary" onClick={handleEditClick}>
            Edit
          </Button>
        </>
      )}

      <ErrorAlertDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        title="Validation Error"
        message={dialogMessage}
      />

    </StyledPaper>
  );
};

export default About;
