import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle as MUIDialogTitle, DialogContent, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllThemesQuery, useUpdateThemesMutation } from '../../slices/api_slices/userApiSlice';
import { setUserCredentials } from '../../slices/userAuthSlice';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import LoadingModal from '../LoadingModal';

// Glassmorphic styles
const GlassmorphicBox = styled(Box)({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  padding: '20px',
  marginBottom: '20px'
});

const ColorBox = styled(Box)(({ color, image, selected }) => ({
  background: color,
  backgroundImage: image,
  width: '50px',
  height: '50px',
  borderRadius: '5px',
  margin: '10px',
  border: selected ? '3px solid #000' : 'none',
  cursor: 'pointer'
}));

const ThemePopup = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userAuth);
  const [defaultTheme, setDefaultTheme] = useState(null);

  const [dialogTitleState, setDialogTitle] = useState(''); // Renamed to dialogTitleState
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const { data, isLoading, isSuccess, isError, error } = useGetAllThemesQuery();
  const [updateTheme, { isLoading: isUpdateLoading }] = useUpdateThemesMutation();

  useEffect(() => {
    if (isSuccess) {
      // Find the theme with name "default"
      const theme = data.find((theme) => theme.name.toLowerCase() === 'default');
      setDefaultTheme(theme);
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isError && error) {
      setDialogTitle('Theme Fetch');
      setDialogMessage('Failed to fetch themes. Reload the page.');
      setDialogOpen(true);
    }
  }, [isError, error]);

  const handleUpdateTheme = async (themeId) => {
    try {
      const response = await updateTheme({ themeId });
      if (response?.data?.success) {
        // Update userInfo in Redux state
        const updatedUserInfo = { ...userInfo, color_theme: response?.data?.color_theme };
        dispatch(setUserCredentials({ userData: updatedUserInfo })); // Dispatch action to update userInfo
        
      }
    } catch (error) {
      setDialogTitle('Theme Update');
      setDialogMessage('Failed to update theme. Try again.');
      setDialogOpen(true);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ backgroundColor: "transparent" }}
    >
      <MUIDialogTitle // Changed to MUIDialogTitle to avoid conflict
        sx={{
          backgroundColor: "transparent",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Select Theme
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </MUIDialogTitle>

      <DialogContent sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
        <GlassmorphicBox sx={{ margin: "auto", marginTop: "0.5rem", marginBottom: '0.5rem' }}>
          <Typography variant="h6">Selected Theme</Typography>
          <ColorBox
            color={userInfo?.color_theme?.background_color}
            image={userInfo?.color_theme?.background_image}
            width="80%"
          />
        </GlassmorphicBox>

        <GlassmorphicBox>
          <Typography variant="h6">Default Theme</Typography>
          {defaultTheme && (
            <ColorBox
              color={defaultTheme.background_color}
              image={defaultTheme.background_image}
              selected={userInfo?.color_theme?._id === defaultTheme._id}
              onClick={() => handleUpdateTheme(defaultTheme._id)}
            />
          )}

          {isSuccess && data && data.length > 0 && (
            <>
              <Typography variant="h6">Available Themes</Typography>
              <Box display="flex" flexWrap="wrap">
                {data.map((theme) => (
                  <ColorBox
                    key={theme._id} // Ensure unique key, using _id if available
                    color={theme.background_color}
                    image={theme.background_image}
                    selected={userInfo?.color_theme?._id === theme._id}
                    onClick={() => handleUpdateTheme(theme._id)}
                  />
                ))}
              </Box>
            </>
          )}
        </GlassmorphicBox>
      </DialogContent>
      <LoadingModal open={isLoading || isUpdateLoading} />

      {!!dialogOpen && (<ErrorAlertDialog
        open={dialogOpen}
        handleClose={() => { setDialogOpen(false) }}
        title={dialogTitleState}
        message={dialogMessage}
      />)}

    </Dialog>
  );
};

export default ThemePopup;
