import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';

const ImageContainer = styled('div')({
  backgroundColor: 'black',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Image = styled('img')({
    maxWidth: '100%',
    maxHeight: '100%',
    minWidth: '50%', // minimum width
    minHeight: '50%', // minimum height
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  });

const EnlargedImagePreview = ({ open, handleClose, imgSrc }) => {
  return (
    <Modal open={open} onClose={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' , }}>
      <ImageContainer>
        <IconButton sx={{color:"#000000", backgroundColor:"#ffffff", position:"absolute", right:"50px", top:"50px"}} onClick={handleClose} >
          <CloseIcon />
        </IconButton>
        <Image src={imgSrc} alt="Enlarged" />
      </ImageContainer>
    </Modal>
  );
};

EnlargedImagePreview.propTypes = {
  open: PropTypes.bool.isRequired, // Whether the modal is open or closed
  handleClose: PropTypes.func.isRequired, // Function to close the modal
  imgSrc: PropTypes.string.isRequired, // Source URL for the image to display
};

export default EnlargedImagePreview;
