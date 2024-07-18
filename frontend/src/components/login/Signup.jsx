import React,{useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogContent, AppBar, Toolbar, Typography, IconButton, Box, Paper, TextField,DialogTitle, Button, Modal, MenuItem, FormControl, InputLabel, Select,RadioGroup, FormControlLabel,FormLabel, Radio, Tooltip, Badge } from '@mui/material';
import { styled, ThemeProvider, useTheme } from '@mui/system'; // Import ThemeProvider
import CloseIcon from '@mui/icons-material/Close';
import {months, days, years} from '../../utils/datGenerate'
import { useRegisterMutation } from '../../slices/api_slices/userApiSlice';
import LoadingModal from '../LoadingModal';
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
    
    position: 'relative', // Ensure position is relative for inner fixed elements
    
}));

const FormContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background:theme.palette.primary.main,
    minWidth:'fit-content',
    borderRadius: '4px',
}));
  
const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: '10px',
    width:'300px',
    borderRadius: '4px',
    background: theme.palette.textFieldbg.main,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: '20px',
    width:'300px',
    backgroundColor: `${theme.palette.submitButton.main}`,
    color: '#fff',
    '&:hover': {
      backgroundColor: `${theme.palette.submitButtonEnhanced.main}`,
    },
    marginBottom:'10px'
}));





const Signup = ({ open, onClose, onEmailVerifyOpen,setUserTempData,}) => {

    const theme = useTheme();
    const [register, { isLoading, isError, isSuccess, error }] = useRegisterMutation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const[gender, setGender] = useState("");
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileWarn, setFileWarn] = useState(false);
    const [nameWarn, setNameWarn] = useState(false)
    const [emailWarn, setEmailWarn] = useState(false)
    const [passwordWarn, setPasswordWarn] = useState(false)
    const [confirmPasswordWarn, setConfirmPasswordWarn] = useState(false)
    const [genderWarn, setGenderWarn] = useState(false)
    const [dobWarn, setDobWarn] = useState(false)
    
    // State for error dialog
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorDialogTitle, setErrorDialogTitle] = useState('');
    const [errorDialogMessage, setErrorDialogMessage] = useState('');




    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          setSelectedFile(file);
          const fileUrl = URL.createObjectURL(file);
          setPreviewUrl(fileUrl);
          setFileWarn(false);
        } else {
          event.target.value = null; // Reset the file input field
          setFileWarn(true); // Open the tooltip
          setPreviewUrl(null);
        }
      };

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (emailRegex.test(email) && email.length < 50);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return (passwordRegex.test(password) && password.length < 30);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Regex to match letters and spaces only
    return (nameRegex.test(name.trim()) && name.length > 0  && name.length < 30);
  };
  
  const validateGender = (gender) => {
    return ['male', 'female', 'other'].includes(gender);
  };

  const validateDate = (year, month, day) => {
    // Convert string inputs to numbers
    year = parseInt(year);
    day = parseInt(day);
  
    // Define an array of month names
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
    // Check if the provided month is a valid month name
    if (!monthNames.includes(month)) {
      return false;
    }
  
    // Convert the month name to its corresponding index (0-based)
    const monthIndex = monthNames.indexOf(month);
  
    // Check if the day is between 1 and 31 (for simplicity, without considering specific month lengths)
    if (day < 1 || day > 31) {
      return false;
    }
  
    // Check if the date is valid using JavaScript's Date object
    const date = new Date(year, monthIndex, day); 
    // Check if the date components match the input
    return date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day;
  };

  const [isSubmitError, setIsSubmitError] = useState(false)

  const handleSubmit = async () => {
    if (!validateName(name)) {
      setNameWarn(true)
      return;
    }

    if(!validateEmail(email)){
      setEmailWarn(true);
      return;
    }

    if(!validatePassword(password)){
      setPasswordWarn(true);
      return;
    }

    if(password !== confirmPassword){
      setConfirmPasswordWarn(true);
      return;
    }

    if(!validateGender(gender)){
      setGenderWarn(true);
      return
    }

    if(!validateDate(selectedYear, selectedMonth, selectedDay)){
      setDobWarn(true);
      return;
    }
    setDobWarn(false)
    

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('gender', gender);
      formData.append('dob', `${selectedYear}-${selectedMonth}-${selectedDay}`);
      if (selectedFile) {
        formData.append('profilePhoto', selectedFile);
      }

      

      const response = await register(formData).unwrap();
      setUserTempData({...response.tempUser,password, gender,name, dob : `${selectedYear}-${selectedMonth}-${selectedDay}`});
      console.log(response)

      // Close the signup modal and open the email verify modal
      onClose();
      onEmailVerifyOpen();
    } catch (error) {
      console.error("Registration failed:", error);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Sign up Error');
      setErrorDialogMessage('Failed to process the signup information');
      
    }
  }

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

    return (
      <ThemeProvider theme={theme}> {/* Wrap your components with ThemeProvider */}
        <StyledModal open={open} onClose={onClose} >
          <StyledPaper  >
            <div  style={{backgroundImage:theme.palette.backgroundColor.main,minWidth:'100%', overflowY: 'auto', position:'relative'}}>
            <AppBar position="sticky">
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sign Up
                  </Typography>
                  <IconButton edge="end" color="inherit" aria-label="close" onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
                </Toolbar>
            </AppBar>
        <Box p={2} width="100%">
          <FormContainer>
            <StyledTextField fullWidth label="Name" variant="outlined" margin="normal" value={name}  onChange={(e) => {
                    const nameValue = e.target.value;
                    setName(nameValue);
                    setNameWarn(!validateName(nameValue));
                  }}
                  error={nameWarn} helperText={nameWarn ? 'Please enter a valid name' : ''}/>
            <StyledTextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={(e) => {
                    const emailValue = e.target.value;
                    setEmail(emailValue);
                    setEmailWarn(!validateEmail(emailValue));
                  }}
                  error={emailWarn} helperText={emailWarn ? 'Please enter a valid email address' : ''}/>
            <StyledTextField fullWidth label="Password" variant="outlined" margin="normal" type="password" value={password} onChange={(e) => {
                    const passwordValue = e.target.value;
                    setPassword(passwordValue);
                    setPasswordWarn(!validatePassword(passwordValue));
                  }}
                  error={passwordWarn}
                  helperText={passwordWarn ? 'Password must be at least 8 characters long, and include at least one letter, one number, and one special character' : ''} />
            
            <StyledTextField
                            fullWidth
                            label="Confirm Password"
                            variant="outlined"
                            margin="normal"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                const confirmPasswordValue = e.target.value;
                                setConfirmPassword(confirmPasswordValue);
                                if (confirmPasswordValue !== password) {
                                setConfirmPasswordWarn(true); // Set warning state to true if passwords don't match
                                } else {
                                setConfirmPasswordWarn(false); // Reset warning state if passwords match
                                }
                            }}
                            error={confirmPasswordWarn} // Set error state based on confirmPasswordWarn
                            helperText={confirmPasswordWarn ? 'Passwords do not match' : ''} // Display helper text when passwords do not match
                            />

            
            
            <FormControl component="fieldset" style={{ width: '300px', marginBottom: '20px' }}>
                <Typography variant="body1" gutterBottom >
                    Gender
                </Typography>
                <Tooltip title={genderWarn ? "Please select a valid gender" : ""} open={genderWarn} arrow>
                  <RadioGroup row value={gender}  onChange={(e) => {
                      const genderValue = e.target.value;
                      setGender(genderValue);
                      setGenderWarn(!validateGender(genderValue));
                    }}
                    
                    sx={{
                                          display: 'flex',
                                          justifyContent: 'center',
                                          '& .MuiFormControlLabel-root': {
                                          marginRight: '16px',
                                          },
                                          '& .MuiRadio-root': {
                                          '&.Mui-checked': {
                                              color:  theme.palette.secondaryButton.main,
                                              backgroundColor: theme.palette.primary.main, // Custom background color
                                              borderRadius: '50%', // Ensure the background is circular
                                              padding: '2px', // Adjust padding for better appearance
                                          },
                                          },
                                          
                                      }}>
                      <FormControlLabel value="male" control={<Radio />} label="Male"  />
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                      <FormControlLabel value="other" control={<Radio />} label="Other" />
                  </RadioGroup>
                </Tooltip>
                
            </FormControl>
            
            
            <Tooltip title={dobWarn ? "Please select a valid date" : ""} open={dobWarn} arrow>
            <Box display="flex" justifyContent="space-between" gap="10px" style={{background: theme.palette.textFieldbg.main,}} >
              
              <FormControl fullWidth variant="outlined"  >
                <InputLabel>Day</InputLabel>
                <Select label="Day" value={selectedDay} onChange={handleDayChange} style={{minWidth:'94px'}}>
                  {days.map((day) => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined" style={{background: theme.palette.textFieldbg.main,}}>
                <InputLabel>Month</InputLabel>
                <Select label="Month" value={selectedMonth} onChange={handleMonthChange} style={{minWidth:'94px'}}>
                  {months.map((month, index) => (
                    <MenuItem key={index} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined" style={{background: theme.palette.textFieldbg.main,}}>
                <InputLabel>Year</InputLabel>
                <Select label="Year" value={selectedYear} onChange={handleYearChange} style={{minWidth:'94px'}}>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              
          </Box>

            </Tooltip>
            

            <FormControl  variant="outlined" style={{ marginTop:'20px'}} >
                    <FormLabel style={{paddingTop:'10px',margin:'0'}}>Profile Photo</FormLabel>
                    <StyledTextField   variant="outlined" margin="normal" type="file" accept="image/*" lable="Profile Photo" style={{width:'300px'}} onChange={handleFileChange}  error = {fileWarn} helperText={fileWarn ? "Please upload an image file" : ""} />

                    {previewUrl && (
                        <Box mt={2} display="flex" justifyContent="center">
                            <img src={previewUrl} alt="Profile Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                        </Box>
                    )}
                </FormControl>
            
            
            <StyledButton variant="contained" fullWidth color="primary" onClick={() => handleSubmit()}>
              Sign Up
            </StyledButton>

            
          </FormContainer>
        </Box>

        

            </div>
            <AppBar position="static" style={{height:'20px', backgroundColor:'#ffff', minWidth:'100%', bottom:'0', overflowY: 'hidden'}}> </AppBar>
            
          </StyledPaper>
        </StyledModal>

        {isLoading &&
                (<LoadingModal open={isLoading} />)
            }

            
        {/* Error Alert Dialog */}
      {isError && (
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



Signup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEmailVerifyOpen: PropTypes.func.isRequired,
  setUserTempData: PropTypes.func.isRequired,
};

export default Signup;
