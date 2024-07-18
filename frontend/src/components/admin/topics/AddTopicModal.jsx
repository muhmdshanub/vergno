import React, { useState } from 'react';
import { Modal, Typography, TextField, Button, Paper, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useCreateTopicFromAdminMutation } from '../../../slices/api_slices/adminApiSlice';

const ModalContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(4px) saturate(200%)',
  '-webkit-backdrop-filter': 'blur(4px) saturate(200%)',
  border: '1px solid rgba(255, 255, 255, .5)',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '8px',
}));

const ModalHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: '#C80036',
  fontWeight: 'bold',
}));

const ModalTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  '& .MuiInputBase-input': {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '5px',
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#0C1844',
  color: '#ffffff',
  padding: theme.spacing(1, 2),
}));

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: theme.spacing(1),
  backgroundColor:'#ffffff',
  padding:'1rem'
}));

const AddTopicModal = ({ open, handleClose }) => {
  const [topicName, setTopicName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const [createTopic] = useCreateTopicFromAdminMutation();

  const validate = () => {
    const errors = {};

    if (topicName.trim().length < 3 || topicName.trim().length > 50) {
      errors.topicName = 'Topic Name must be between 3 and 50 characters.';
    }

    if (description.trim().length < 3 || description.trim().length > 500) {
      errors.description = 'Description must be between 3 and 500 characters.';
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createTopic({ name: topicName.trim(), description: description.trim() }).unwrap();
      handleClose();
    } catch (err) {
      console.error('Failed to create topic:', err);
      setErrors({ api: `Failed to create topic. Please try again. ${err?.data?.message}` });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-topic-modal-title"
      aria-describedby="add-topic-modal-description"
    >
      <ModalContainer>
        <ModalHeader variant="h6" id="add-topic-modal-title">
          Add New Topic
        </ModalHeader>
        <ModalTextField
          label="Topic Name"
          variant="outlined"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          error={!!errors.topicName}
          helperText={errors.topicName}
        />
        <ModalTextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          error={!!errors.description}
          helperText={errors.description}
        />
        {errors.api && <ErrorText>{errors.api}</ErrorText>}
        <SubmitButton variant="contained" onClick={handleSubmit}>
          Submit
        </SubmitButton>
      </ModalContainer>
    </Modal>
  );
};

export default AddTopicModal;
