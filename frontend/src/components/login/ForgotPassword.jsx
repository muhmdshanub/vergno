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
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.palette.primary.main,
  minWidth: 'fit-content',
  borderRadius: '4px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '10px',
  width: '300px',
  borderRadius: '4px',
  background: theme.palette.textFieldbg.main,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: '20px',
  width: '300px',
  backgroundColor: `${theme.palette.submitButton.main}`,
  color: '#fff',
  '&:hover': {
    backgroundColor: `${theme.palette.submitButtonEnhanced.main}`,
  },
  marginBottom: '10px'
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
            <AppBar position="sticky">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Forgot Password
                </Typography>
                <IconButton edge="end" color="inherit" aria-label="close" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Box p={2} width="100%">
              <FormContainer>
                {step === 1 && (
                  <>
                    <Typography variant="h6" gutterBottom>
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
                    <Typography variant="h6" gutterBottom>
                      Enter the OTP we sent to your email: <strong>{email}</strong>
                    </Typography>
                    <StyledTextField fullWidth label="OTP" variant="outlined" margin="normal" value={otp} onChange={handleChangeOtp} 
                      error={otpWarn}
                      helperText={otpWarn ? "OTP should be exactly 6 digits" : ""}
                    />
                    <Typography variant="body2" gutterBottom>
                      {timeLeft > 0 ? formatTimeLeft(timeLeft) : "OTP expired"}
                    </Typography>
                    <Button variant="contained" sx={{ backgroundColor: theme.palette.secondaryButton.main, color: theme.palette.primary.main }} disabled={timeLeft > 150} onClick={handleResendOtp}>
                      Resend OTP
                    </Button>
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
            </Box>
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
