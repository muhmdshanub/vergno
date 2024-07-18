import React from 'react';
import PropTypes from 'prop-types';
import { Modal, CircularProgress, Box, Typography } from '@mui/material';
import GradientCircularProgress from './GradientCircularProgress';

const LoadingModal = ({ open }) => {
  return (
    <Modal
      open={open}
      
      style={{ zIndex:99999999 }} // Ensure this is higher than other modals (default is 1300)
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Box
          p={3}
          bgcolor="background.paper"
          borderRadius="16px" // Rounded corners
          boxShadow={6} // Higher shadow for more elevation
          maxWidth="80vw" // Limit the width of the modal
          maxHeight="100vh" // Limit the height of the modal
          overflow="auto" // Allow scrolling if content exceeds the modal's dimensions
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
