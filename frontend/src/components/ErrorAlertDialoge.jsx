import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PropTypes from 'prop-types';

const ErrorAlertDialog = ({ open, handleClose, title, message }) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title" color="secondary">{title}</DialogTitle>
    <DialogContent >
      <div id="alert-dialog-description" color="secondary">{message}</div>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="secondary" autoFocus>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

ErrorAlertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default ErrorAlertDialog;