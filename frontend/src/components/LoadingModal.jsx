import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography } from '@mui/material';
import GradientCircularProgress from './GradientCircularProgress';

const LoadingModal = ({ open }) => {
  return (
    <Modal
      open={open}
      sx={{ zIndex: 99999999 }} // Using sx prop for consistency with MUI v5
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{
          backdropFilter: 'blur(10px)', // Apply blur to the background
        }}
      >
        <Box
          p={3}
          sx={{
            background: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
            borderRadius: '8px', // Rounded corners
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.35)', // Soft shadow
            backdropFilter: 'blur(10px)', // Frosted glass effect
            border: '1px solid rgba(255, 255, 255, 0.45)', // Light border
            maxWidth: '80vw', // Limit the width of the modal
            maxHeight: '100vh', // Limit the height of the modal
            overflow: 'auto', // Allow scrolling if content exceeds the modal's dimensions
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <GradientCircularProgress />
            <Typography mt={2}>Loading...</Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

LoadingModal.propTypes = {
  open: PropTypes.bool.isRequired, // Boolean flag to control the modal open state
};

export default LoadingModal;

