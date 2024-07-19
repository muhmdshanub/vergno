import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Paper, AppBar, Toolbar, Typography, IconButton, Box, TextField, Button, Snackbar, Alert } from '@mui/material';
import { styled, ThemeProvider, useTheme } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation,
    useVerifyForgotPasswordOtpMutation,
    useResetPasswordMutation, } from '../../slices/api_slices/userApiSlice';
import LoadingModal from '../LoadingModal';
import ErrorAlertDialog from '../ErrorAlertDialoge';

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0',
  borderRadius: '4px',
  boxShadow: theme.shadows[3],
  minWidth: 'fit-content',
  width: '500px',
  maxHeight: '80vh',
  backgroundColor:'transparent'
}));

const GlassmorphicAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
  backdropFilter: 'blur(6px) saturate(150%)', // Blur and saturate for the glass effect
  WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3], // Subtle shadow for depth
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const GlassmorphicBox = styled(Box)(({theme})=>({
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(6px) saturate(150%)',
  WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
}))

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  minWidth: 'fit-content',
  
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '20px',
  width: '300px',
  borderRadius: '0.4rem',
  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
  border: '1px solid rgba(255, 255, 255, 0.4)', // Light border for the glass effect
  backdropFilter: 'blur(10px)', // Blur for the glass effect
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
  color: `${theme.palette.text.primary}`, // Ensure text color is readable
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)', // Border color of the TextField
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.4)', // Border color on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.6)', // Border color when focused
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '300px',
  backgroundColor: 'rgba(62, 166, 250, 0.8)', // submitButton main color with 50% opacity
  color: '#ffffff',
  marginTop: '20px',
  border: '1px solid rgba(255, 255, 255, 0.8)', // Light border for the glass effect
  backdropFilter: 'blur(10px) saturate(180%)', // Blur for the glass effect
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Light shadow for depth
  borderRadius: '0.4rem',
  '&:hover': {
    backgroundColor: 'rgba(0, 141, 255, 0.9)', // submitButtonEnhanced main color with 50% opacity
  },
}));

const ResendButton = styled(Button)(({ theme }) => ({
  width: '300px',
  backgroundColor: 'rgba(7, 135, 176, 0.4)', // secondaryButton main color with 50% opacity
  color: '#ffffff',
  marginTop: '10px',
  border: '1px solid rgba(255, 255, 255, 0.4)', // Light border for the glass effect
  backdropFilter: 'blur(10px) saturate(180%)', // Blur for the glass effect
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Light shadow for depth
  borderRadius: '0.4rem',
  '&:hover': {
    backgroundColor: 'rgba(6, 124, 161, 0.5)', // secondaryButtonEnhanced main color with 50% opacity
  },
}));



const ForgotPassword = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [step, setStep] = useState(1);
  const [otpWarn, setOtpWarn] = useState(false);
  

  const [forgotPassword, { isLoading: isLoadingEmail , isError: isErrorForgotPassword}] = useForgotPasswordMutation();
  const [verifyForgotPasswordOtp, { isLoading: isLoadingVerifyOtp, isError: isErrorVerifyOtp }] = useVerifyForgotPasswordOtpMutation();
  const [resetPassword, { isLoading: isLoadingReset, isError : isErrorResetPassword }] = useResetPasswordMutation();

   // State for error dialog
   const [errorDialogOpen, setErrorDialogOpen] = useState(false);
   const [errorDialogTitle, setErrorDialogTitle] = useState('');
   const [errorDialogMessage, setErrorDialogMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTimeLeft => (prevTimeLeft > 0 ? prevTimeLeft - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const handleChangeOtp = (e) => {
    const value = e.target.value;
    setOtp(value);
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(value)) {
      setOtpWarn(true);
    } else {
      setOtpWarn(false);
    }
  };

  const formatTimeLeft = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} min ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} sec`;
  };

  const handleResendOtp = async () => {
    try {
      const body = { email };
      await forgotPassword(body).unwrap();
      setSuccess("Otp send to email")
      setTimeLeft(180);
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Resend Error');
      setErrorDialogMessage('Failed to send reset email');
      console.error('Failed to resend OTP:', error);
    }
  };

  const handleSubmitEmail = async () => {
    try {
      const result = await forgotPassword({ email }).unwrap();
      
      setStep(2);
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Submit Error');
      setErrorDialogMessage('Failed to submit');
      console.error('Failed to send reset email:', error);
    }
  };

  const handleSubmitOtp = async () => {
    try {
      const result = await verifyForgotPasswordOtp({ email, otp }).unwrap();
      
      setStep(3);
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Error Otp verify');
      setErrorDialogMessage('Failed to verify OTP');
      console.error('Failed to verify OTP:', error);
    }
  };

  const handleSubmitNewPassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        setError('Passwords Do not Match', error.message);
        return;
      }
      await resetPassword({ email, newPassword }).unwrap();
      
      onClose()
      navigate("/")
      window.location.reload()
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('reset Password Error');
      setErrorDialogMessage('Failed to reset password');
      console.error('Failed to reset password:', error);
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledModal open={open} onClose={onClose}>
        <StyledPaper>
          <div style={{ backgroundImage: theme.palette.backgroundColor.main, minWidth: '100%', overflowY: 'auto' }}>
            <GlassmorphicAppBar position="sticky">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 , color:'#ffffff'}}>
                  Forgot Password
                </Typography>
                <IconButton edge="end" color="inherit" aria-label="close" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </GlassmorphicAppBar>
            <GlassmorphicBox p={2} width="100%">
              <FormContainer>
                {step === 1 && (
                  <>
                    <Typography variant="h6" sx={{color:'#ffffff'}} gutterBottom>
                      Enter your email id
                    </Typography>
                    <StyledTextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <StyledButton variant="contained" fullWidth color="primary" onClick={handleSubmitEmail}>
                      Submit
                    </StyledButton>
                    {isLoadingEmail && <LoadingModal open={isLoadingEmail} />}
                  </>
                )}
                {step === 2 && (
                  <>
                    <Typography variant="h6" sx={{color:'#ffffff'}} gutterBottom>
                      Enter the OTP we sent to your email: <strong>{email}</strong>
                    </Typography>
                    <StyledTextField fullWidth label="OTP" variant="outlined" margin="normal" value={otp} onChange={handleChangeOtp} 
                      error={otpWarn}
                      helperText={otpWarn ? "OTP should be exactly 6 digits" : ""}
                    />
                    <Typography variant="body2" gutterBottom>
                      {timeLeft > 0 ? formatTimeLeft(timeLeft) : "OTP expired"}
                    </Typography>
                    <ResendButton variant="contained" sx={{ backgroundColor: theme.palette.secondaryButton.main, color: theme.palette.primary.main }} disabled={timeLeft > 150} onClick={handleResendOtp}>
                      Resend OTP
                    </ResendButton>
                    {isLoadingVerifyOtp && <LoadingModal open={isLoadingVerifyOtp} />}
                    <StyledButton variant="contained" fullWidth color="primary" onClick={handleSubmitOtp}>
                      Submit
                    </StyledButton>
                  </>
                )}
                {step === 3 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Create new password
                    </Typography>
                    <StyledTextField fullWidth label="New Password" variant="outlined" margin="normal" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <StyledTextField fullWidth label="Confirm Password" variant="outlined" margin="normal" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    {isLoadingReset && <LoadingModal open={isLoadingReset} />}
                    <StyledButton variant="contained" fullWidth color="primary" onClick={handleSubmitNewPassword}>
                      Submit
                    </StyledButton>
                  </>
                )}
              </FormContainer>
            </GlassmorphicBox>
          </div>
        </StyledPaper>
      </StyledModal>
      {(isErrorResetPassword || isErrorForgotPassword || isErrorVerifyOtp) && (
        <ErrorAlertDialog
          open={errorDialogOpen}
          handleClose={handleCloseErrorDialog}
          title={errorDialogTitle}
          message={errorDialogMessage}
        />
      )}
    </ThemeProvider>
  );
};




ForgotPassword.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default ForgotPassword;
