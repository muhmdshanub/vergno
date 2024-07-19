import React,{useState, useEffect} from 'react';
import { Backdrop, Button, TextField, Typography, Link, Paper, Divider, Box, Grid, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@emotion/react';
import { useSelector, useDispatch } from 'react-redux';
 import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import Signup from '../components/login/Signup';
import EmailVerify from '../components/login/EmailVerify';
import ForgotPassword from '../components/login/ForgotPassword';
import LoadingModal from '../components/LoadingModal';
import GradientCircularProgress from '../components/GradientCircularProgress';
import { useLoginMutation, useVerifyirebaseAuthenticationMutation, } from '../slices/api_slices/userApiSlice';
import { setUserCredentials } from '../slices/userAuthSlice';
import { firebaseApp } from '../firebase'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import ErrorAlertDialog from '../components/ErrorAlertDialoge';


const auth = getAuth(firebaseApp);

const Wrapper = styled('div')(({ theme }) =>({
  margin: '40px 10px',  // 40px margin on all sides
  [theme.breakpoints.down('md')]: {
    paddingLeft:'0',
    alignItems: 'flex-start',
  },
  
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(6px) saturate(150%)',
  WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px 80px',
  width: '100%',
  borderRadius: '10px',
  minWidth:'fit-content',
  
  
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center', // Center items horizontally
  minWidth: 'fit-content',
  
  [theme.breakpoints.down('md')]: {
    borderRight: 'none',
    paddingRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const InfoContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center', // Center items horizontally
  minHeight:'100%',
  minWidth:'fit-content',
  [theme.breakpoints.down('md')]: {
    margin: '50px 0',
    alignItems: 'flex-start',
  },
}));



const LoginButton = styled(Button)(({ theme }) => ({
  width: '300px',
  backgroundColor: 'rgba(62, 166, 250, 0.8)', // submitButton main color with 50% opacity
  color: '#ffffff',
  marginTop: '20px',
  border: '1px solid rgba(255, 255, 255, 0.8)', // Light border for the glass effect
  backdropFilter: 'blur(10px)', // Blur for the glass effect
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Light shadow for depth
  borderRadius: '0.4rem',
  '&:hover': {
    backgroundColor: 'rgba(0, 141, 255, 0.9)', // submitButtonEnhanced main color with 50% opacity
  },
}));




const SignupButton = styled(Button)(({ theme }) => ({
  width: '300px',
  backgroundColor: 'rgba(7, 135, 176, 0.8)', // secondaryButton main color with 50% opacity
  color: '#ffffff',
  marginTop: '10px',
  border: '1px solid rgba(255, 255, 255, 0.4)', // Light border for the glass effect
  backdropFilter: 'blur(10px)', // Blur for the glass effect
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Light shadow for depth
  borderRadius: '0.4rem',
  '&:hover': {
    backgroundColor: 'rgba(6, 124, 161, 0.9)', // secondaryButtonEnhanced main color with 50% opacity
  },
}));


// const StyledTextField = styled(TextField)(({ theme }) => ({
//   marginBottom: '20px',
//   width:'300px',
//   borderRadius: '0.4rem',
//   backgroundColor:`${theme.palette.textFieldbg.main}`
// }));


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

const StyledGoogleButton = styled(Button)(({ theme }) => ({
  width:'300px',
  marginTop: '20px',
  backgroundColor: '#ffffff',
  color: '#000000',
  border: '1px solid #000000',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  borderRadius: '0.4rem',
}));



const StyledDivider = styled(Divider)({
  margin: '20px 0',
  width:'300px',
});

const LoginScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [login, { isLoading, isSuccess, isError : isLoginError, }] = useLoginMutation();
  const [verifyirebaseAuthentication, {isLoading : firebaseCallbakLoading}] = useVerifyirebaseAuthenticationMutation();

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailWarn, setEmailWarn] = useState(false)
  const [passwordWarn, setPasswordWarn] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false);
  const [emailVerifyOpen, setEmailVerifyOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [userTempData, setUserTempData] = useState("");
  const [formData, setFormData]  = useState(null);
  const [submitResponseError, setSubmitResponseError] = useState("");



    // State for error dialog
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogTitle, setErrorDialogTitle] = useState('');
    const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (emailRegex.test(email) && email.length < 100);
  };

  const validatePassword = (password) => {
   
    return (password.length >= 8 && password.length <= 50);
  };

  const handleSignupOpen = () => {
    setSignupOpen(true);
  };

  const handleSignupClose = () => {
    setSignupOpen(false);
  };

  const  handleEmailVerifyOpen = () =>{
    setEmailVerifyOpen(true)
  }

  const  handleEmailVerifyClose = () =>{
    setEmailVerifyOpen(false)
  }

  
  const loginSubmitHandler = async (e) =>{
    e.preventDefault();

    if(!validateEmail(email)){
      setEmailWarn(true);
      return;
    }

    if(!validatePassword(password)){
      setPasswordWarn(true);
      return;
    }

    try {
      const user = await login({ email, password }).unwrap();
      dispatch(setUserCredentials(user));
      navigate('/');
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Login Error');
      setErrorDialogMessage(`An error occurred during logging in : ${error?.data?.message}`);
      console.log(submitResponseError);
    }
  }



 
  const googleSignInWithFirebase = async () => {
    try {
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userCredential = result;
      const user = userCredential.user;

      const firebaseToken = await user.getIdToken();

      

      try {
        const user = await verifyirebaseAuthentication({ firebaseToken }).unwrap();
        dispatch(setUserCredentials(user));
        navigate('/');
      } catch (error) {
        console.log("Error while logging in using google : " , error)
        setErrorDialogOpen(true);
        setErrorDialogTitle('Signing Google');
        setErrorDialogMessage(`Error signing in with Google : ${error?.data?.message}`);
      }
  
      
    } catch (error) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Signing Google');
      setErrorDialogMessage(`Error signing in with Google : ${error?.data?.message}`);
      console.error("Error signing in with Google: ", error.message);
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

  return (
    <Wrapper>
      <LoginPaper elevation={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} >
            <FormContainer >
              <Typography variant="h4" gutterBottom style={{maxWidth:'300px'}}>
                Login
              </Typography>
              <StyledTextField label="Email" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => {
                    const emailValue = e.target.value;
                    setEmail(emailValue);
                    setEmailWarn(!validateEmail(emailValue));
                  }}
                  error={emailWarn} helperText={emailWarn ? 'Please enter a valid email address' : ''}  
              />
              <StyledTextField label="Password" variant="outlined" type="password" fullWidth margin="normal" value={password} onChange={(e) => {
                    const passwordValue = e.target.value;
                    setPassword(passwordValue);
                    setPasswordWarn(!validatePassword(passwordValue));
                  }}
                  error={passwordWarn}
                  helperText={passwordWarn ? 'Password must be at least 8 characters long, and include at least one letter, one number, and one special character' : ''} 
              />
              <LoginButton variant="contained" style={{}} onClick={e => loginSubmitHandler(e)}>
                Login
              </LoginButton>
              {/* submit error  */}

              {submitResponseError &&
                <Backdrop open={true} style={{ zIndex: 9999 }}>
                  <Box
                      component="div"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        
                        borderRadius: '10px',
                        border: '2px solid #000',
                        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
                        backgroundColor: '#d5f2f7',
                        color : theme.palette.danger.main,
                        position:'relative',
                        height:'50vh',
                        width:'500px'
                      }}
                    >
                    <div style={{minWidth:'100%', minHeight:'80px', backgroundColor:'#ffff',margin:'0', borderRadius: '10px',}}>

                    </div>
                    <Button onClick={setSubmitResponseError(null)} style={{backgroundColor:theme.palette.danger.main, color: theme.palette.primary.main,position:'absolute',top:'20px',right:'20px' }}>Close</Button>
                    
                    <Typography variant="h6" color="info" style={{position:'absolute', bottom:'0',top:'20vh'}}>{submitResponseError}</Typography>
                  </Box>
                </Backdrop>
            }


              <Button onClick={() => setForgotPasswordOpen(true)} variant="body2" color="danger"  sx={{ display: 'block', marginTop: '10px', maxWidth: '300px' }}>
                      Forgot Password?
              </Button>
              <ForgotPassword open={forgotPasswordOpen} onClose={()=>{
                setForgotPasswordOpen(false)
                navigate('/');
              }} />
              <StyledDivider />
              <SignupButton variant="contained" fullWidth onClick={handleSignupOpen} >
                Create New Account?
              </SignupButton>
              <Signup open={signupOpen} onClose={handleSignupClose} onEmailVerifyOpen={handleEmailVerifyOpen} setUserTempData={setUserTempData}   />
              <EmailVerify open={emailVerifyOpen} onClose={handleEmailVerifyClose} userTempData={userTempData} setUserTempData={setUserTempData} formData={formData}  setFormdDta={setFormData} />
            </FormContainer>
          </Grid>
          <Grid item xs={12} md={6} >
            <InfoContainer >
            <Typography variant="h5" gutterBottom style={{ width: '300px' }}>
                <span style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.2em' }}>VerGno</span> is a place for everyone to learn and grow together.
            </Typography>
              

              <StyledGoogleButton variant="outlined" startIcon={<GoogleIcon />}  onClick={() => googleSignInWithFirebase()} >
                Continue with Google
              </StyledGoogleButton>

              

            </InfoContainer>
          </Grid>
        </Grid>
      </LoginPaper>


      {(!!errorDialogOpen) && (
        <ErrorAlertDialog
        open={errorDialogOpen}
        handleClose={handleCloseErrorDialog}
        title={errorDialogTitle}
        message={errorDialogMessage}
      />
      )}
    </Wrapper>
    
  );
};

export default LoginScreen;
