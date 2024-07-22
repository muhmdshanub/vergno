import React,{useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, Slider,Snackbar, Alert, Backdrop, CircularProgress, AppBar, Toolbar, Typography, IconButton, Box, Paper, TextField, Button, Modal, MenuItem, FormControl, InputLabel, Select,RadioGroup, FormControlLabel,FormLabel, Radio, Tooltip, Badge } from '@mui/material';
import { styled, ThemeProvider, useTheme } from '@mui/system'; // Import ThemeProvider
import CloseIcon from '@mui/icons-material/Close';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import CropIcon from '@mui/icons-material/Crop';
import Cropper from 'react-easy-crop';
import {getCroppedImg} from '../../utils/getCroppedImage.js';
import { useLazyAutofillSuggestionsQuery } from '../../slices/api_slices/topicsApiSlice.js';
import { useAddQueryToProfileMutation } from '../../slices/api_slices/queryApiSlice.js';
import LoadingModal from '../LoadingModal.jsx';
import { useLocation } from 'react-router-dom';
import ErrorAlertDialog from '../ErrorAlertDialoge.jsx';


const scrollBarStyles = {
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
};

const StyledModal = styled(Modal)(({ theme }) => ({ // Use destructuring to access the theme
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'transparent',
    
    
  }));

  const GlassmorphicAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
    backdropFilter: 'blur(6px) saturate(150%)', // Blur and saturate for the glass effect
    WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3], // Subtle shadow for depth
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius:"10px 10px 0px 0px"
    
  }));
  
  const GlassmorphicBox = styled(Box)(({theme})=>({
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(6px) saturate(150%)',
    WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    ...scrollBarStyles
    
  }))

const FormContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth:'fit-content',
    borderRadius: '4px',
}));
  
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '20px',
  width: '400px',
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
  width: '400px',
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


const UploadButton = styled(Button)(({ theme }) => ({
    width: '400px',
    backgroundColor: 'rgba(7, 135, 176, 0.8)', // secondaryButton main color with 50% opacity
  color: '#ffffff',
  marginTop: '10px',
  border: '1px solid rgba(255, 255, 255, 0.4)', // Light border for the glass effect
  backdropFilter: 'blur(10px) saturate(180%)', // Blur for the glass effect
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Light shadow for depth
  borderRadius: '0.4rem',
  '&:hover': {
    backgroundColor: 'rgba(6, 124, 161, 0.5)', // secondaryButtonEnhanced main color with 50% opacity
  },
    marginBottom: '10px',
  }));

const ImagePreviewContainer = styled(Box)({
    width: '400px',
    height: '200px',
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
    position:"relative",
  });
  
  const ImagePreview = styled('img')({
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  });



const AddQuery = ({ openModal, onCloseModal}) => {

    const theme = useTheme();
    const location = useLocation();
    
    // Get the lazy query function
    const [fetchSuggestions, { data: topicsData, error : autofillError, isLoading: isAutofillLoading, isError : isAutofillError }] = useLazyAutofillSuggestionsQuery();
    const [addQueryToProfile, {data : queryAddResponse, isLoading : isLoadingAddQuery}] = useAddQueryToProfileMutation();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileWarn, setFileWarn] = useState(false);
    const [snackbarAlert, setSnackbarAlert] = useState("")
    const [snackbarSuccess, setSnackbarSuccess] = useState("")
    



    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [cropping, setCropping] = useState(false);
    
    const [width, setWidth] = useState(4);
    const [height, setHeight] = useState(3);

    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');

      // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');


    const clearAllStates = ()=>{
      setTitle("")
      setDescription("")
      setImage("")
      setSelectedTopic("")
      setPreviewUrl("")
    }

    useEffect(()=>{
      console.log(selectedTopic)
    },[selectedTopic])

    useEffect(() => {
      let active = true;
  
      if (inputValue === '') {
        setOptions([]);
        return;
      }
  
      fetchSuggestions({search : inputValue}).then((result) => {
        if (active && result.data) {
          setOptions(result.data);
        }
      });
  
      return () => {
        active = false;
      };
    }, [inputValue, fetchSuggestions]);



    useEffect(()=>{
      if(isAutofillError === true){
        
        setErrorDialogOpen(true);
        setErrorDialogTitle('Topics Suggestion Error');
        setErrorDialogMessage(`Error getting topics suggestion : ${autofillError?.message}`);
      }
    },[isAutofillError])

    

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          setImage(file);
          const fileUrl = URL.createObjectURL(file);
          setPreviewUrl(fileUrl);
          setFileWarn(false);
        } else {
          event.target.value = null; // Reset the file input field
          setFileWarn(true); // Open the tooltip
          setPreviewUrl(null);
        }
      };

    const handleCloseImage = ()=>{
      setImage("");
      setPreviewUrl("");
      setFileWarn(false);
    }



    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    };
  
    const handleSaveCrop = async () => {
      const croppedImage = await getCroppedImg(previewUrl, croppedAreaPixels);
      setImage(croppedImage);
      setPreviewUrl(croppedImage);
      setCropping(false);
    };


   const handleCloseSnackbar = () =>{
    setSnackbarAlert("")
   }

   const handleCloseSnackbarSuccess = () =>{
    setSnackbarSuccess("")
   }

   // Function to validate title format (only letters, numbers, spaces, and special characters, max 50)
  const isValidTitle = (title) => {
    return /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{1,50}$/.test(title.trim());
  };

  // Function to validate description length (max 1000 characters)
  const isValidDescription = (description) => {
    return description.trim().length <= 1000 && description.trim().length >0;
  };

  // Function to validate selected topic (assuming it should be a valid object ID)
  const isValidTopic = (topic) => {
    return typeof topic === 'string' && topic.length > 0; // Modify as per your actual validation logic
  };

  

const handleAddQuery = async () =>{
      

      if(!isValidTitle(title)){
        console.log("title invalid")
        setErrorDialogOpen(true);
        setErrorDialogTitle('Add Query Error');
        setErrorDialogMessage(`Invalid title.`);
        return
      }

      if(!isValidDescription(description)){
        setErrorDialogOpen(true);
        setErrorDialogTitle('Add Query Error');
        setErrorDialogMessage(`Invalid description. 1 to 1000 characters supported.`);
        return
      }

      if(!isValidTopic(selectedTopic)){
        setErrorDialogOpen(true);
        setErrorDialogTitle('Add Query Error');
        setErrorDialogMessage(`Invalid topic.`);
        return
      }

      try {
        const formData = new FormData();
        formData.append('topic', selectedTopic);
        formData.append('description', description);
        formData.append('title', title);
        if (image) {
          formData.append('queryPhoto', image);
        }
  
        
         const response = await addQueryToProfile(formData).unwrap();

        setSnackbarSuccess("Your Query has posted");
        clearAllStates();
        onCloseModal();

        // Check if the current path is within /profiles/*
        if (location.pathname.startsWith('/profile')) {
          window.location.reload(); // Reload the page
        }
      } catch (error) {
        console.error("query add :", error);
        setErrorDialogOpen(true);
        setErrorDialogTitle('Add Query Error');
        setErrorDialogMessage(`An error occured while adding query. ${error?.data?.message}`);
        
      }

   }

   const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };

    return (
      <ThemeProvider theme={theme}> {/* Wrap your components with ThemeProvider */}
        <StyledModal open={openModal} onClose={onCloseModal} sx={{minWidth: 'fit-content',borderRadius:'100px' }} >
          
            <div  style={{ width:'500px', position:'relative',borderRadius:'10px'}}>
            <GlassmorphicAppBar position="sticky" style={{borderRadius:"10px 10px 0px 0px"}}>
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1, color:'#ffffff' }}>
                    Add Query
                  </Typography>
                  <IconButton edge="end" color="inherit" aria-label="close" onClick={onCloseModal}>
                    <CloseIcon />
                  </IconButton>
                </Toolbar>
            </GlassmorphicAppBar>
              <GlassmorphicBox p={2} width="100%" sx={{overflowY:"auto",maxHeight:"70vh"}}>
                <FormContainer>
                  <StyledTextField fullWidth label="Title" variant="outlined" margin="normal" value={title}  onChange={(e) => {
                          const titleValue = e.target.value;
                          setTitle(titleValue);
                        }}
                  />
                  <StyledTextField fullWidth label="Description" variant="outlined" multiline rows={4} margin="normal" value={description} onChange={(e) => {
                          
                          setDescription(e.target.value);
                        }}
                  />
                

                  {/* Image upload section */}
                  <UploadButton variant="contained" component="label">
                      <PhotoLibraryOutlinedIcon />
                      <input hidden accept="image/*" type="file" onChange={(e) => handleFileChange(e)} />
                      Upload Image
                    </UploadButton>
                    {previewUrl && (
                            <ImagePreviewContainer>
                          

                                            {!cropping && (
                                              <>
                                                <ImagePreview src={previewUrl} alt="Selected preview" />
                                                <IconButton edge="end" aria-label="close" style={{ position: 'absolute', right: '1rem', top: '1rem', backgroundColor: theme.palette.primary.main }} onClick={handleCloseImage}>
                                                  <CloseIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="crop" style={{ position: 'absolute', right: '1rem', top: '4rem', backgroundColor: theme.palette.primary.main }} onClick={() => setCropping(true)}>
                                                  <CropIcon />
                                                </IconButton>
                                              </>
                                            )}

                                            {cropping && (
                                              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                                <Cropper
                                                  image={previewUrl}
                                                  crop={crop}
                                                  zoom={zoom}
                                                  aspect={width / height}
                                                  onCropChange={setCrop}
                                                  onZoomChange={setZoom}
                                                  onCropComplete={handleCropComplete}
                                                />
                                                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', p: 2 }}>
                                                  <Button onClick={() => setCropping(false)} variant="contained" color="secondary">Cancel</Button>
                                                  <Button onClick={handleSaveCrop} variant="contained" color="primary">Save</Button>
                                                </Box>
                                              </Box>
                                            )}

                                                    


                            </ImagePreviewContainer>
                    )}

                    {
                                                      cropping && (
                                                        <Box sx={{ mt: 2, backgroundColor:"#9999",  width: "400px", padding:'5px'}}>
                                                          <Typography gutterBottom sx={{ color: '#fff' }}>Aspect Ratio</Typography>
                                                          <Box display="flex" alignItems="center" sx={{ color: '#fff' }}>
                                                            <Typography sx={{ mr: 1 }}>Width</Typography>
                                                            <Slider
                                                              value={width}
                                                              onChange={(e, newValue) => setWidth(newValue)}
                                                              aria-labelledby="width-slider"
                                                              valueLabelDisplay="auto"
                                                              min={1}
                                                              max={16}
                                                              sx={{ mx: 2 }}
                                                              style={{ color: '#fff' }}
                                                            />
                                                            <Typography>{width}</Typography>
                                                          </Box>
                                                          <Box display="flex" alignItems="center" sx={{ color: '#fff' }}>
                                                            <Typography sx={{ mr: 1 }}>Height</Typography>
                                                            <Slider
                                                              value={height}
                                                              onChange={(e, newValue) => setHeight(newValue)}
                                                              aria-labelledby="height-slider"
                                                              valueLabelDisplay="auto"
                                                              min={1}
                                                              max={16}
                                                              sx={{ mx: 2 }}
                                                              style={{ color: '#fff' }}
                                                            />
                                                            <Typography>{height}</Typography>
                                                          </Box>
                                                        </Box>
                                                      )
                                                    }            
                  <Autocomplete
                    style={{marginBottom: '10px', width:'400px', backgroundColor: 'rgba(255, 255, 255, 0.8)',padding:'5px 10px', borderRadius:'5px' }}
                    freeSolo
                    id="free-solo-2-demo"
                    disableClearable
                    options={options.map((option) => ({ label: option.name, value: option._id }))}
                    onChange={(event, newValue) => {
                      setSelectedTopic(newValue.value); // Set the selected topic object
                    }}
                    onInputChange={(event, newInputValue) => {
                      setInputValue(newInputValue.trimStart());
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Topic"
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          type: 'search',
                        }}
                      />
                    )}
                  />
                  
                  <StyledButton variant="contained" fullWidth color="primary" onClick={handleAddQuery}>
                    Add Query
                  </StyledButton>

                  

                  
                </FormContainer>
              </GlassmorphicBox>

        

            </div>
        {/* <AppBar position="static" style={{height:'20px', backgroundColor:'#ffff', minWidth:'100%', bottom:'0', overflowY: 'hidden'}}> Hi </AppBar> */}
            
        
        </StyledModal>

        {isLoadingAddQuery &&
                  <LoadingModal open={isLoadingAddQuery} />
                }
        <Snackbar open={!!snackbarAlert} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {snackbarAlert}
            </Alert>
        </Snackbar>
        <Snackbar open={!!snackbarSuccess} autoHideDuration={6000} onClose={handleCloseSnackbarSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
          <Alert onClose={handleCloseSnackbarSuccess} severity="success" sx={{ width: '100%' }}>
            {snackbarSuccess}
          </Alert>
        </Snackbar>

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


AddQuery.propTypes = {
  openModal: PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,
};


export default AddQuery;

