import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { styled, Avatar, Box,Card, CardHeader, CardContent, CardActions,TextField, Button, IconButton,DialogActions, Dialog, DialogTitle, DialogContent, DialogContentText, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import { Comment, Close } from '@mui/icons-material';
import relativeTime from '../../utils/relativeTime';
import { useDeleteAnswerMutation, useReportAnswerMutation } from '../../slices/api_slices/answersApiSlice';



const reasons = [
  'Inappropriate Content',
  'Spam or Misleading',
  'Harassment or Bullying',
  'Hate Speech',
  'Violation of Community Guidelines',
];

const CommentWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: '10px',
  margin: '10px 0',
  width:"100%"
}));

const AvatarWrapper = styled('div')(({ theme }) => ({
  marginRight: '10px',
  
}));

const CommentContent = styled(Card)(({theme})=>({
  
  alignItems: 'center',
  padding: '10px', boxShadow: 3,
  borderRadius: '10px',
  marginBottom: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(8px) saturate(180%)',
  WebkitBackdropFilter: 'blur(8px) saturate(180%)',
  border: '1px solid rgba(209, 213, 219, 0.6)',
}))

const CommentText = styled('p')(({ theme }) => ({
  margin: '0',
  padding: '0',
  maxHeight:"80px",
  overflowY:"auto",
  
}));

const CommentActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: '5px',
    fontSize: '0.8em',
    color: '#0073e6',
    cursor: 'pointer',
  
    '& span:hover': {
      textDecoration: 'underline',
    },
  }));
  
  const ActionButton = styled('button')(({ theme }) => ({
    background: 'none',
    border: 'none',
    padding: '0',
    color: '#0073e6',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover': {
      textDecoration: 'none',
    },
  }));
  
  const LikeCount = styled('span')(({ theme }) => ({
    color: '#333',
  }));

  const StyledFormControlLabel = styled(FormControlLabel)(({ theme, checked }) => ({
    '& .MuiRadio-root': {
      color: checked ? "#000000" : "#545454",
      '& .MuiFormControlLabel-label': {
    color: checked ?  "#000000" : "#666633",
  },
    },
    
  }));

const SingleAnswer = ({answer, setErrorFlag, onRemoveAnswer}) => {
    const { author, text, time, likes, authorId } = answer;
    const theme = useTheme();

    const {userInfo} = useSelector(state => state.userAuth)
    const {fallbackImage} = useSelector(state => state.fallbackImage)



//report answer

const [openDialog, setOpenDialog] = useState(false);
const [selectedReason, setSelectedReason] = useState('');
const [customReason, setCustomReason] = useState('');

const [reportAnswer] = useReportAnswerMutation();


const handleOpenDialog = () => {
    setOpenDialog(true);
   
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCustomReason(''); // Reset reason when closing the dialog
    setSelectedReason('')
    setErrorFlag('')
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
    if (event.target.value !== 'Custom') {
      setCustomReason('');
    }
  };

  const handleCustomReasonChange = (event) => {
    setCustomReason(event.target.value);
  }

  const handleSubmitReport = async () => {
    const reportReason = selectedReason === 'Custom' ? customReason : selectedReason;

    if (reportReason.trim() === '' || reportReason.length > 100) {
      setErrorFlag('Reason must be provided and less than 100 characters.');
      return;
    }
  
    try {
      await reportAnswer({
        reason : reportReason,
        answer_source: 'user_profile',
        answer_id: answer._id
      }).unwrap();
      handleCloseDialog(); // Close the dialog after submitting the report
    } catch (err) {
      console.error('Failed to report answer:', err);
      setErrorFlag('Failed to report answer. Please try again.');
    }
  };

  //delete answer

  const [deleteAnswer] = useDeleteAnswerMutation();

  const handleDeleteAnswer = async () => {
    try {
      
        const result = await deleteAnswer({ answer_id: answer._id }).unwrap();
        if(result.success === true){
          onRemoveAnswer(answer._id); // Call the remove function
        }
        
    } catch (error) {
        console.error('Failed to delete answer:', error);
        setErrorFlag('Failed to delete answer');
    }
  };
   
  return (
    <CommentWrapper >
      <AvatarWrapper>
        <Avatar src={answer?.answererInfo?.image?.url || answer?.answererInfo?.googleProfilePicture || fallbackImage} alt={author} />
      </AvatarWrapper>
      <Box style={{width:'100%'}}>
        <CommentContent>
            <strong>{answer.answererInfo.name}</strong>
            <CommentText>{answer.answer_content}</CommentText>
            
        </CommentContent>
        <CommentActions>
          <div style={{display:'flex',justifyContent: 'space-between',alignItems:"center", paddingLeft:"10px", color:theme.palette.primary.main}}>
            <span style={{marginRight:'10px'}}>{relativeTime(answer.answered_at)}</span>
            
            
            { (answer.isAbleToChnageHelpful)  &&(
                <ActionButton sx={{color:theme.palette.primary.main,marginLeft:'10px',marginRight:'10px'}}>Solve</ActionButton>
            )}
            
            { (answer.isAbleToDelete)  &&(
                <ActionButton sx={{color:theme.palette.primary.main,marginLeft:'10px',marginRight:'10px'}} onClick={handleDeleteAnswer}>Delete</ActionButton>
            )}
            
            <ActionButton sx={{color:theme.palette.primary.main}} onClick={handleOpenDialog}>Report</ActionButton>
          </div>
          
          
          {/* <span style={{marginRight:'10px'}}> {answer.isHelpful ? "Accepted" : "Accepted"}</span> */}
         
        </CommentActions>


      </Box>


      <Dialog open={openDialog} onClose={handleCloseDialog}>
                                          <DialogTitle>Report Answer</DialogTitle>
                                          <DialogContent>
                                          <DialogContentText>
                                              Please provide the reason for reporting this answer.
                                          </DialogContentText>
                                          <FormControl component="fieldset">
                    <FormLabel component="legend">Select a reason:</FormLabel>
                    <RadioGroup
                      value={selectedReason}
                      onChange={handleReasonChange}
                    >
                      {reasons.map((reason) => (
                        <StyledFormControlLabel
                          key={reason}
                          value={reason}
                          control={<Radio />}
                          label={reason}
                          checked={selectedReason === reason}
                        />
                      ))}
                      <StyledFormControlLabel
                        value="Custom"
                        control={<Radio />}
                        label="Other (please specify)"
                        checked={selectedReason === "Custom"}
                      />
                    </RadioGroup>
                    {selectedReason === "Custom" && (
                      <TextField
                        autoFocus
                        margin="dense"
                        label="Reason"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={customReason}
                        onChange={handleCustomReasonChange}
                        sx={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                      />
                    )}
                  </FormControl>
                                          </DialogContent>
                                          <DialogActions>
                                          <Button onClick={handleCloseDialog} color="success">
                                              Cancel
                                          </Button>
                                          <Button onClick={handleSubmitReport} color="danger">
                                              Submit
                                          </Button>
                                          </DialogActions>
                                      </Dialog>
    
      
    </CommentWrapper>
  );
};




SingleAnswer.propTypes = {
    answer: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        author: PropTypes.string,
        text: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        likes: PropTypes.number,
        authorId: PropTypes.string,
        answer_content: PropTypes.string.isRequired,
        answered_at: PropTypes.string.isRequired,
        isAbleToChnageHelpful: PropTypes.bool,
        isAbleToDelete: PropTypes.bool,
        answererInfo: PropTypes.shape({
            name: PropTypes.string.isRequired,
            image: PropTypes.shape({
                url: PropTypes.string
            }),
            googleProfilePicture: PropTypes.string
        })
    }).isRequired,
    setErrorFlag: PropTypes.func.isRequired,
    onRemoveAnswer: PropTypes.func.isRequired
};


export default SingleAnswer;
