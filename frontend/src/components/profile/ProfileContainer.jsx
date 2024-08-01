import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Avatar,TextField, Typography,DialogActions, Grid, IconButton, Dialog, DialogTitle, DialogContent, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/getCroppedImage.js';
import ErrorAlertDialog from '../admin/ErrorAlertDialog.jsx';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';





const ProfileContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'transparent', // Semi-transparent background
  backdropFilter: 'blur(10px) saturate(200%)',
  WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255,255,255, 0.05)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  width: '100%',
  maxWidth: '900px',
  margin: '50px',
  height: 'fit-content',
}));

const Name = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.2rem',
  marginBottom: theme.spacing(1),
}));

const Stats = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const UploadButton = styled('label')(({ theme }) => ({
  display: 'inline-block',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Profile = ({ name, followers, following, profilePicture, onUpdateProfilePhoto, onUpdateProfileName, isProfilePhotoLoading }) => {

  const theme = useTheme();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.userAuth.userInfo);
  const {fallbackImage} = useSelector(state => state.fallbackImage)

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropRatio, setCropRatio] = useState('4:3'); // Default crop ratio
  const cropOptions = ['4:3', '16:9', '1:1', 'Free']; // Define your crop ratio options here
  const [height, setHeight] = useState(1);
  const [width, setWidth] = useState(1);


  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const handleEditImage = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedImage(null); // Reset selected image state
    setCrop({ x: 0, y: 0 }); // Reset crop position
    setZoom(1); // Reset zoom level
    setCroppedAreaPixels(null); // Reset cropped area
  };

  const handleClearImage = () => {
    setSelectedImage(null); // Clear selected image preview
    setCrop({ x: 0, y: 0 }); // Reset crop position
    setZoom(1); // Reset zoom level
    setCroppedAreaPixels(null); // Reset cropped area
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        
        setErrorDialogTitle('File type not supported')
        setErrorDialogMessage('Invalid file type. Please select a JPEG or PNG image.')
        setErrorDialogOpen(true)
        return;
      }

      // Validate file size (less than 1MB)
      if (selectedFile.size > 1024 * 1024) {
       
        setErrorDialogTitle('File Size Exceeded')
        setErrorDialogMessage('File size exceeds 1MB. Please select a smaller image.')
        setErrorDialogOpen(true)
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result); // Set selected image for preview
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return;

    const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);
    // Handle cropped image, e.g., upload to server or update state
    console.log('Cropped Image:', croppedImage);

    // Reset states after saving crop
    setSelectedImage(croppedImage); // Update preview with cropped image
    setCrop({ x: 0, y: 0 }); // Reset crop position
    setZoom(1); // Reset zoom level
    setCroppedAreaPixels(null); // Reset cropped area
  };

  const handleRatioChange = (event) => {
    const ratio = event.target.value;
    setCropRatio(ratio);

    // Adjust crop aspect ratio based on selected ratio
    switch (ratio) {
      case '4:3':
        setWidth(4);
        setHeight(3);
        break;
      case '16:9':
        setWidth(16);
        setHeight(9);
        break;
      case '1:1':
        setWidth(1);
        setHeight(1);
        break;
      default:
        setWidth(1);
        setHeight(1);
        break;
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    // Fetch the blob data from selectedImage
    const blobData = await fetch(selectedImage).then((res) => res.blob());
    
    // Create FormData and append blobData
    const formData = new FormData();
    formData.append('profilePhoto', blobData, 'profile_photo.jpg'); // 'profile_photo.jpg' is the file name

    try {
      console.log("selected image is ", selectedImage)
      console.log("formData is ", formData)
      const response = await onUpdateProfilePhoto(formData);

      
      
      handleCloseDialog()

    } catch (error) {
      console.error('Error uploading image:', error.message);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Upload Error');
      setErrorDialogMessage('Failed to upload image. Please try again.');
    }
  };


  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };



  // State for name dialog and editing it
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleEditName = () => {
    setNewName(name); // Set the current name as the initial value
    setNameDialogOpen(true);
  };

  const handleCloseNameDialog = () => {
    setNameDialogOpen(false);
  };

  const handleUpdateName = async () => {
    if (newName.trim() === '') {
      setErrorDialogTitle('Invalid Name');
      setErrorDialogMessage('Name cannot be empty.');
      setErrorDialogOpen(true);
      return;
    }
    
    try {

      const result = await onUpdateProfileName(newName.trim());

      

    } catch (error) {
      console.error('Error uploading image:', error.message);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Update Error');
      setErrorDialogMessage('Failed to update name. Please try again.');
    }
    handleCloseNameDialog()

  };


  return (
    <ProfileContainer>
      <Grid container alignItems="center" justifyContent="space-around" spacing={2}>
        <Grid item xs={12} md={5} sx={{ textAlign: 'center',  }}>
          <Box sx={{width:'fit-content', position:'relative', margin:'auto'}}>
            <Avatar src={profilePicture || fallbackImage} alt={name} sx={{ width: '150px', height: '150px', margin:'auto', position:'relative' }}>
            
            </Avatar>
            <IconButton
                onClick={handleEditImage}
                sx={{ position:'absolute',right:'5px', bottom:'5px', backgroundColor: '#ffffff', color:'#000000',  }}
                aria-label="edit image"
              >
                <EditIcon />
              </IconButton>
          </Box>

          
        </Grid>
        <Grid item xs={12} md={7} sx={{  justifyContent:'center'}}>
          <Box sx={{display:"flex", alignItems:'center'}}>
              <Name sx={{position: 'relative'}}>{name}</Name>
              <IconButton
                onClick={handleEditName}
                sx={{ backgroundColor: "#ffffff"}}
                aria-label="edit name"
              >
                <EditIcon />
              </IconButton>
          </Box>
          
          <Stats>{followers} Followers • {following} Following</Stats>
        </Grid>
      </Grid>

      {/* Dialog for adding new profile picture */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add New Profile Picture</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12}>
                <Box sx={{ position: 'relative', minHeight: '300px' }}>
                  <Cropper
                    image={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={width / height}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                  <IconButton
                    onClick={handleClearImage}
                    sx={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ffffff' }}
                    aria-label="clear image"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="crop-ratio-label">Crop Ratio</InputLabel>
                  <Select
                    labelId="crop-ratio-label"
                    id="crop-ratio"
                    value={cropRatio}
                    onChange={handleRatioChange}
                  >
                    {cropOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Button onClick={handleSaveCrop} variant="contained" color="primary">
                    Save Crop
                  </Button>
                  <Button onClick={handleCloseDialog} sx={{ marginLeft: '8px' }}>Cancel</Button>
                </Box>
              </Grid>

              <Grid item xs={6} >
                <Box sx={{ textAlign: 'center', }}>
                  <Button onClick={handleUploadImage} variant="contained" color="secondary">
                    {isProfilePhotoLoading ? <CircularProgress /> : "Upload Image"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          {!selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleImageChange}
                style={{ display: 'none' }} // Hide the input element
                id="upload-button" // Add id for label reference
              />
              <UploadButton htmlFor="upload-button">Choose a Photo</UploadButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>


      {/* Dialog for editing name */}
      <Dialog open={nameDialogOpen} onClose={handleCloseNameDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={name}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNameDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateName} color="danger">
            Update
          </Button>
        </DialogActions>
      </Dialog>



      <ErrorAlertDialog
          title={errorDialogTitle}
          message={errorDialogMessage}
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
        />
    </ProfileContainer>
  );
};


Profile.propTypes = {
  name: PropTypes.string.isRequired,
  followers: PropTypes.number.isRequired,
  following: PropTypes.number.isRequired,
  profilePicture: PropTypes.string, // Assuming profilePicture is a URL
  onUpdateProfilePhoto: PropTypes.func.isRequired,
  onUpdateProfileName: PropTypes.func.isRequired,
  isProfilePhotoLoading: PropTypes.bool.isRequired,
};


export default Profile;
