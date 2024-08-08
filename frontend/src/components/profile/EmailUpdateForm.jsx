import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import { useUpdateUserEmailInfoMutation, useSubmitUserEmailOtpInfoMutation } from '../../slices/api_slices/profileApiSlice';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import LoadingModal from '../LoadingModal';

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

const EmailUpdateForm = ({ initialEmail }) => {
  const [updateUserEmailInfo, {isLoading: emailUpdateLoading}] = useUpdateUserEmailInfoMutation();
  const [submitUserEmailOtp, {isLoading: otpSubmitLoading}] = useSubmitUserEmailOtpInfoMutation();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [updatedEmail, setUpdatedEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [otpGenerationTime, setOtpGenerationTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [DialogTitle, setDialogTitle] = useState('Validation Error');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [stage, setStage] = useState('initial');
  
  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    let timer;
    if (isOtpVisible) {
      timer = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - otpGenerationTime) / 1000;
        setTimeRemaining(Math.max(0, 180 - elapsed));

        if (elapsed >= 180) {
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpVisible, otpGenerationTime]);

  const handleEmailEditClick = () => {
    
    setStage('edit')
  };

  const handleEmailCancelClick = () => {
    
    setStage('initial')
    setUpdatedEmail(initialEmail)
  };

  const handleEmailUpdateClick = async () => {
    if (!validateEmail(email)) {
      setDialogTitle('Validation Error')
      setDialogMessage('Invalid email format.');
      setDialogOpen(true);
      return;
    }

    if(updatedEmail === email){
      setDialogTitle('Validation Error')
      setDialogMessage('Email not changed.');
      setDialogOpen(true);
      return;
    }

    try {
      const response = await updateUserEmailInfo({ email : updatedEmail });
      
      if(response.data.success){
        setDialogTitle('Validation Acknowledgement')
        setDialogMessage('OTP sent to Email.');
        setDialogOpen(true);
        setOtpGenerationTime(Date.now());
        setIsEditingEmail(false);
        setIsOtpVisible(true);
        setStage('otp')
      }
      
      
    } catch (error) {
      console.error('Error updating email:', error);
      setDialogTitle('Validation Error')
      setDialogMessage('Failed to update email. Please try again.');
      setDialogOpen(true);
      setStage('initial')
      setUpdatedEmail(email);
    }
  };

  const handleOtpSubmitClick = async () => {

    if (!validateOtp(otp)) {
      setDialogTitle('Validation Error')
      setDialogMessage('Invalid OTP format.');
      setDialogOpen(true);
      return;
    }

    try {
      const response = await submitUserEmailOtp({ otp });
      if(response?.data?.success){
        setDialogTitle('Validation Acknowledgement')
        setDialogMessage('Email updated to', response?.data?.new_email);
        setDialogOpen(true);
        setStage('initial');
        setUpdatedEmail(response?.data?.new_email);
        setEmail(response?.data?.new_email);
      }
      
      
    } catch (error) {
      console.error('Error updating email:', error);
      setDialogTitle('Validation Error')
      setDialogMessage('Failed to verify OTP. Please try again.');
      setDialogOpen(true);
      setUpdatedEmail(email);
      
    }

  };

  const handleResendOtpClick = async () => {
    try {
      const response = await updateUserEmailInfo({ email : updatedEmail });
      if(response?.data?.success){
        setStage('otp')
        setOtpGenerationTime(Date.now());
        setDialogTitle('Validation Acknowledgement')
        setDialogMessage('OTP resent successfully.');
        setDialogOpen(true);

      }
      
    } catch (error) {
      console.error('Error resending OTP:', error);
      setDialogTitle('Validation Error')
      setDialogMessage('Failed to resend OTP. Please try again.');
      setDialogOpen(true);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const validateOtp = (otp) => {
    // Assuming OTP is a 6-digit number
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  };
  

  const handleDialogClose = () => {
    setDialogTitle('Validation Error')
    setDialogOpen(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Box sx={{ marginBottom: "2rem" }}>
      {stage === "initial" && (
        <>
          <InfoRow>
            <Label>Email:</Label>
            <Typography>{email}</Typography>
          </InfoRow>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleEmailEditClick}
          >
            {" "}
            Edit{" "}
          </Button>
        </>
      )}

      {stage === "edit" && (
        <>
          <InfoRow>
            <Label>Email:</Label>
            <TextField
              name="email"
              value={updatedEmail}
              onChange={(e) => setUpdatedEmail(e.target.value)}
              fullWidth
              sx={{backgroundColor:'rgba(0,0,0, 0.1)'}}
            />
          </InfoRow>

          <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
              variant="outlined"
              color="danger"
              onClick={handleEmailCancelClick}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleEmailUpdateClick}
            >
              Update
            </Button>
            
          </Box>
        </>
      )}

      {stage === "otp" && (
        <>
          <InfoRow>
            <Label>OTP For Email:</Label>
            <TextField
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              sx={{backgroundColor:'rgba(0,0,0, 0.1)'}}
            />
          </InfoRow>

          <Typography variant="body2" color="textSecondary" mt={2}>
            Time remaining: {formatTime(timeRemaining)}
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2}>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleResendOtpClick}
              disabled={timeRemaining > 165}
            >
              Resend OTP
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleOtpSubmitClick}
              disabled={timeRemaining === 0}
            >
              Submit OTP
            </Button>
          </Box>
        </>
      )}
      
      <LoadingModal open={emailUpdateLoading || otpSubmitLoading} />

      <ErrorAlertDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        title={DialogTitle}
        message={dialogMessage}
      />
    </Box>
  );
};

export default EmailUpdateForm;
