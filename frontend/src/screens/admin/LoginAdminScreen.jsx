import React,{useState} from 'react';
import { Backdrop, Button, TextField, Typography, Link, Paper, Divider, Box, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@emotion/react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingModal from '../../components/LoadingModal';
import { useAdminLoginMutation } from '../../slices/api_slices/adminApiSlice';
import { setAdminCredentials } from '../../slices/adminAuthSlice';


const Wrapper = styled('div')(({ theme }) =>({
  margin: '40px',  // 40px margin on all sides
  [theme.breakpoints.down('md')]: {
    paddingLeft:'0',
    alignItems: 'flex-start',
  },
  
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px 100px',
  width: '100%',
  borderRadius: '10px',
  boxShadow: theme.shadows[3],
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
  width:'300px',
  backgroundColor: `${theme.palette.submitButton.main}`,
  color: '#ffff',
  marginTop: '20px',
  '&:hover': {
    backgroundColor: `${theme.palette.submitButtonEnhanced.main}`,
  },
  borderRadius: '0.4rem',
}));



const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '20px',
  width:'300px',
  borderRadius: '0.4rem',
  backgroundColor:`${theme.palette.textFieldbg.main}`
}));



const StyledDivider = styled(Divider)({
  margin: '20px 0',
  width:'300px',
});

const LoginAdminScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  
  
  const [adminLogin, { isLoading, isSuccess, isError }] = useAdminLoginMutation();

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailWarn, setEmailWarn] = useState(false)
  const [passwordWarn, setPasswordWarn] = useState(false)
  const [submitResponseError, setSubmitResponseError] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (emailRegex.test(email) && email.length < 100);
  };

  const validatePassword = (password) => {
   
    return (password.length >= 8 && password.length <= 50);
  };

 

  

  
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
      const res = await adminLogin({ email, password }).unwrap();
      dispatch(setAdminCredentials(res.adminData));
      navigate('/admin');
    } catch (error) {
      console.log("Error while logging in : " , error)
      setSubmitResponseError(error?.message || 'An error occurred during registration');
    }
  }


  return (
    <Wrapper>
      <LoginPaper elevation={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} >
            <FormContainer >
              <Typography variant="h4" gutterBottom style={{maxWidth:'300px'}}>
                Admin Login
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


              {/* <Link href="#" variant="body2" color={theme.palette.danger.main} sx={{ display: 'block', marginTop: '10px' }} style={{maxWidth:'300px'}}>
                Forgot Password?
              </Link> */}
              <StyledDivider />
              </FormContainer>
          </Grid>
          <Grid item xs={12} md={6} >
            <InfoContainer >
            <Typography variant="h5" gutterBottom style={{ width: '300px' }}>
                <span style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.2em' }}>VerGno</span> is a place for everyone to learn and grow together.
            </Typography>
              
            </InfoContainer>
          </Grid>
        </Grid>
      </LoginPaper>

      {isLoading &&
        <LoadingModal open={isLoading} />
      }
    </Wrapper>
  );
};

export default LoginAdminScreen;
