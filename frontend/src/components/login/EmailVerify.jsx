import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Backdrop, AppBar, Toolbar, Typography, IconButton, Box, Paper, TextField, Button, Modal, Dialog,DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled, ThemeProvider, useTheme } from '@mui/system'; // Import ThemeProvider
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch} from 'react-redux';
import {  useNavigate } from "react-router-dom";
import { useVerifyEmailOtpMutation,useResendEmailOtpMutation } from '../../slices/api_slices/userApiSlice';
import LoadingModal from '../LoadingModal';
import { setUserCredentials } from '../../slices/userAuthSlice';
import ErrorAlertDialog from '../ErrorAlertDialoge';


const StyledModal = styled(Modal)(({ theme }) => ({ // Use destructuring to access the theme
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',


}));

const StyledPaper = styled(Paper)(({ theme }) => ({ // Use destructuring to access the theme
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

const EmailVerify = ({ open, onClose, userTempData, setUserTempData,}) => {


  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  const theme = useTheme();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // Initial time left in seconds
  const [email, setEmail] = useState("example@example.com");
  const [otpWarn, setOtpWarn] = useState(false);
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const [submitErrorDisplay, setSubmitErrorDisplay] = useState(false)
  
  const [verifyEmailOtp, { isLoading : isLoadingSubmit, isSuccess : isSuccessSubmit, isError : isErrorSubmit, error: errorSubmit }] = useVerifyEmailOtpMutation();
  const [resendEmailOtp, { isLoading : isLoadingResend, isSuccess : isSuccessResend, isError : isErrorResend, error: errorResend}] = useResendEmailOtpMutation();

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');


  useEffect(() => {
    if (userTempData) {
      console.log("user temp data is ",userTempData)
      // Extract OTP generation time and email from userTempData
      const { otpSentAt, email } = userTempData;

      // Calculate elapsed time since OTP generation
      const otpSentTime = new Date(otpSentAt);
      const currentTime = new Date();
      const elapsedTime = (currentTime - otpSentTime) / 1000; // Convert milliseconds to seconds

      // Set time limit to 3 minutes (180 seconds)
      const timeLimit = 180;

      // Calculate time left
      const time_Left = Math.max(timeLimit - elapsedTime, 0);

      // Update state with email and time left
      setEmail(email);
      setTimeLeft(time_Left);
    }
  }, [userTempData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTimeLeft => (prevTimeLeft > 0 ? prevTimeLeft - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [userTempData]);



  const handleChangeOtp = (value) => {
    
    setOtp(value);

    // Validate OTP: it should be exactly 6 digits
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
      

      // Prepare the request body
      
      const body = {
        email: userTempData.email,
        image_info: userTempData.image_info,
        name: userTempData.name,
        password: userTempData.password,
        dob: userTempData.dob,
        gender: userTempData.gender
      };
  
      // Make the resend OTP request
      const response = await resendEmailOtp(body).unwrap();
      
      setUserTempData((prevData) => ({
        ...prevData,
        ...response.tempUser,
      }));
      console.log("new userTempData ", userTempData)
  
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Resend Error');
      setErrorDialogMessage('Failed to resend OTP');
      console.error('Failed to resend OTP:', error);
    }
  };

  

  const handleSubmitOtp = async () => {

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      setOtpWarn(true);
      return
    }

    try {
      const user = await verifyEmailOtp({
        otp,
        email,
        tempUserId: userTempData._id,
      }).unwrap();
      console.log('OTP verified:', user);
      dispatch(setUserCredentials(user)); // Dispatch the action to set user credentials
      navigate('/'); // Navigate to home screen
      
    } catch (err) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('OTP Verify');
      setErrorDialogMessage('Failed to verify OTP');
      console.error('Failed to verify OTP:', err);
      
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledModal open={open} onClose={onClose} >
        <StyledPaper  >
          <div style={{ backgroundImage: theme.palette.backgroundColor.main, minWidth: '100%', overflowY: 'auto' }}>
            <AppBar position="sticky">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Verify Email
                </Typography>
                <IconButton edge="end" color="inherit" aria-label="close" onClick={onClose} disabled={timeLeft > 120} >
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Box p={2} width="100%">
              <FormContainer>

              <Typography
                  variant="body1"
                  gutterBottom
                  sx={{
                    padding: '30px',
                    borderRadius: '8px',
                    color:theme.palette.primary.main,
                    backgroundColor: theme.palette.danger.main, // Light background color
                    width: '100%',
                    height:'50px',
                    textAlign: 'center',
                    marginTop:'20px',
                  }}
                >
                 <strong>Do not close unless you want to cancel the signup.</strong>
                </Typography>

              <Typography
                  variant="body1"
                  gutterBottom
                  sx={{
                    padding: '30px',
                    borderRadius: '8px',
                    backgroundColor: theme.palette.textFieldbg.main, // Light background color
                    width: '300px',
                    textAlign: 'center',
                    marginTop:'20px',
                  }}
                >
                  Please enter the OTP we sent to your email id: <strong>{email}</strong>
                </Typography>
                <StyledTextField fullWidth label="OTP" variant="outlined" margin="normal" value={otp} onChange={e => handleChangeOtp(e.target.value)} 
                    error={otpWarn}
                    helperText={otpWarn ? "OTP should be exactly 6 digits" : ""} 
                    
                />


                <Typography variant="body2" gutterBottom>
                      {timeLeft > 0 ? formatTimeLeft(timeLeft)  : "OTP expired"}
                </Typography>

                <Button variant="contained" sx={{backgroundColor: theme.palette.secondaryButton.main, color: theme.palette.primary.main}} disabled={timeLeft > 150} onClick={handleResendOtp}>
                  Resend OTP
                </Button>

                


                {/* loading display for otp resend api */}
                {isLoadingResend &&
                    <LoadingModal open={isLoadingResend} style={{zIndex:'3000'}} />
                }

                <StyledButton variant="contained" fullWidth color="primary"  onClick={handleSubmitOtp}>
                  Submit
                </StyledButton>

                {/* loading display for otp submit api */}
                {isLoadingSubmit &&
                  <LoadingModal open={isLoadingSubmit} />
                }
              
                

              </FormContainer>
            </Box>

          </div>

        </StyledPaper>
      </StyledModal>

      {(!!errorDialogOpen) && (
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



EmailVerify.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setUserTempData: PropTypes.func.isRequired,
};

export default EmailVerify;
