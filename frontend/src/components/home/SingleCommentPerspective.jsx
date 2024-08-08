import React, { useState, useEffect , useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import { styled, Avatar, Box,Card, CardHeader, CardContent, CardActions,TextField, Button, IconButton,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import { Comment, Close } from '@mui/icons-material';
import { usePerspectiveReplyMutation, useLikePerspectiveCommentMutation, useUnlikePerspectiveCommentMutation, useReportCommentMutation, useGetAllCRepliesForPerspectiveCommentQuery, useDeletePerspectiveCommentMutation, useDeletePerspectiveReplyMutation } from '../../slices/api_slices/allCommentsApiSlice.js';
import relativeTime from '../../utils/relativeTime.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import LoadingModal from '../LoadingModal.jsx';
import CommentLoading from '../CommentLoading.jsx';


const reasons = [
  'Inappropriate Content',
  'Spam or Misleading',
  'Harassment or Bullying',
  'Hate Speech',
  'Violation of Community Guidelines',
];

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


  const ReplyCard = styled(Card)(({theme})=>({
  
    alignItems: 'center',
    padding: '10px', boxShadow: 3,
    borderRadius: '10px',
    marginBottom: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(8px) saturate(180%)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
    border: '1px solid rgba(209, 213, 219, 0.6)',
  }))

  const StyledFormControlLabel = styled(FormControlLabel)(({ theme, checked }) => ({
    '& .MuiRadio-root': {
      color: checked ? "#000000" : "#545454",
      '& .MuiFormControlLabel-label': {
    color: checked ?  "#000000" : "#666633",
  },
    },
    
  }));

const SingleCommentPerspective = ({perspectiveId, comment, setErrorFlag, onRemoveComment }) => {
    const theme = useTheme();
    const [replyBox, setReplyBox] = useState(false);
    const [viewReplies, setViewreplies] = useState(false);
    const [replyCount, setReplyCount] = useState(comment.reply_count || 0)


    const {userInfo} = useSelector(state => state.userAuth)
    const {fallbackImage} = useSelector(state => state.fallbackImage)

    const newCommentRef = useRef(null);

    const [commentContent, setCommentContent] = useState('');
    const [perspectiveReply] = usePerspectiveReplyMutation();


    const handleReplyBoxOpen = () =>{
        setReplyBox(true)
    }

    const handleReplyBoxClose = () =>{
        setReplyBox(false)
    }
    const handleViewReplies = () =>{
      setViewreplies(!viewReplies);
    }


    const handleCommentChange = (event) => {
      setCommentContent(event.target.value);
    };
  
    const handleCommentSubmit = async () => {
      // Validate comment content
      if (typeof commentContent !== 'string' || commentContent.trim().length === 0 || commentContent.length > 500) {
        setErrorFlag("invalid reply format.")
        return;
      }
  
      try {
        // Call the queryComment mutation
        const response = await perspectiveReply({ comment_content: commentContent, parent_perspective_id: perspectiveId, parent_comment_id : comment._id  }).unwrap();
        console.log('Reply added successfully:', response);
        setCommentContent(''); // Clear the input field after successful submission
        setReplyBox(false)

        setReplyCount(prevCount => prevCount+1)
        // Update the comments state with the new comment at the beginning
        setComments(prevComments => {
          const newComments = [response.comment, ...prevComments];
          // Use setTimeout to ensure the DOM is updated before scrolling
          setTimeout(() => {
            if (newCommentRef.current) {
              newCommentRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
          return newComments;
        });

        setViewreplies(true);

      } catch (error) {
        console.error('Failed to add comment:', error);
        setErrorFlag('Failed to add comment:', JSON.stringify(error))
      }
    };

    //like functinality

    const [isLiked, setIsLiked] = useState(comment?.liked);
    const [likeCount, setLikeCount] = useState(comment?.like_count);

    const [likePerspectiveCommentMutation,{isSuccess : isLikeSuccess}] = useLikePerspectiveCommentMutation();
    const [unlikePerspectiveCommentMutation, {isSuccess : isUnlikeSuccess}] = useUnlikePerspectiveCommentMutation();


    useEffect(()=>{
      if(isLikeSuccess === true){
        setIsLiked(true);
        setLikeCount(likeCount => likeCount + 1); // Increase like count
      }
    },[isLikeSuccess])

    useEffect(()=>{
      if(isUnlikeSuccess === true){
        setIsLiked(false);
        setLikeCount(likeCount => likeCount - 1); // Increase like count
      }
    },[isUnlikeSuccess])


    const handleLike = async () => {
      try {
        
        await likePerspectiveCommentMutation({ comment_id: comment._id });
        
      } catch (error) {
        console.error('Error liking perspective comment:', error);
      }
    };
  
    const handleUnlike = async () => {
      try {
        await unlikePerspectiveCommentMutation({ comment_id: comment._id });
        setIsLiked(false);
       
      } catch (error) {
        console.error('Error unliking perspective comment:', error);
      }
    };

    //report coment

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const [reportComment] = useReportCommentMutation();


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
          await reportComment({
            reason : reportReason,
            comment_type: 'perspectiveComment',
            comment_source: 'user_profile',
            comment_id: comment._id
          }).unwrap();
          handleCloseDialog(); // Close the dialog after submitting the report
        } catch (err) {
          console.error('Failed to report post:', err);
          setErrorFlag('Failed to report post. Please try again.');
        }
      };


        //fetching comments all

const [comments, setComments] = useState([]);
const [tempComments, setTempComments] = useState([]);
const [commentsPage, setCommentsPage] = useState(1);
const [hasMoreComments, setHasMoreComments] = useState(true);

const { data : commentsData, error : commentsError, isLoading : isCommentsLoading, isSuccess : isCommentsSuccess,isError : isCommentsError, refetch : refetchComments } = useGetAllCRepliesForPerspectiveCommentQuery(
  { perspective_comment_id : comment._id, page : commentsPage, limit : '10' },
);

useEffect(() => {
  if (commentsData && isCommentsSuccess === true) {
    if (commentsPage === 1) {
      
      setComments(commentsData?.replies || []);
      setCommentsPage((prevPage) => prevPage + 1);
      refetchComments();
    } else {
      setTempComments(commentsData?.replies || []);
    }
    setHasMoreComments((commentsData?.replies || []).length > 0);
  }
  
}, [ commentsData, refetchComments]);

useEffect(()=>{
  if (commentsError) {
    console.error('Error fetching replies:', commentsError);
    setErrorFlag(JSON.stringify(commentsError?.data?.message || commentsError?.message) || 'Error fetching replies');
  }
}, [isCommentsError])

const fetchMoreComments = () =>{
  
   setComments(prevComments => [...prevComments, ...tempComments]);
   if(!isCommentsLoading){
     setCommentsPage(prevPage => prevPage + 1);
     refetchComments();
   }
   
}


//delete comment and reply

const [deletePerspectiveComment] = useDeletePerspectiveCommentMutation();
const [deletePerspectiveReply] = useDeletePerspectiveReplyMutation();

const removeChildReply = (commentId) =>{
  setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
  setReplyCount(count => count-1)
}

const handleDeleteComment = async () => {
  try {
    
      const result = await deletePerspectiveComment({ comment_id: comment._id }).unwrap();
      if(result.success === true){
        onRemoveComment(comment._id); // Call the remove function
      }
      
  } catch (error) {
      console.error('Failed to delete comment:', error);
      setErrorFlag('Failed to delete comment');
  }
};

const handleDeleteReply = async (commentId) => {
  try {
    
      const result = await deletePerspectiveReply({ reply_id: commentId }).unwrap();
      if(result.success === true){
        onRemoveComment(comment._id);
        
      }
      
      
  } catch (error) {
      console.error('Failed to delete reply:', error);
      setErrorFlag('Failed to delete reply');
  }
};


const handleDelete = async () => {
  if (comment.is_reply) {
      await handleDeleteReply(comment._id);
  } else {
      await handleDeleteComment(comment._id);
  }
};
  


  return (
    <CommentWrapper >
      <AvatarWrapper>
        <Avatar src={comment?.commenterInfo?.image?.url || comment?.commenterInfo?.googleProfilePicture || fallbackImage} alt={comment?.commenterInfo?.name} />
      </AvatarWrapper>
      <Box style={{width:'100%'}}>
        <CommentContent>
            <strong style={{cursor:"pointer"}}>{comment?.commenterInfo?.name}</strong>
            <CommentText>{comment.comment_content}</CommentText>
            
        </CommentContent>
        <CommentActions>
          <div style={{display:'flex',justifyContent: 'space-between',alignItems:"center", paddingLeft:"10px", color:theme.palette.primary.main}}>
            <span style={{marginRight:'10px'}}>{relativeTime(comment.commented_at)}</span>
            <ActionButton sx={{marginRight:'10px', color:theme.palette.primary.main, marginLeft:'10px'}} onClick={isLiked ? handleUnlike : handleLike}>{isLiked ? "unlike" : "like" }</ActionButton>
            <ActionButton sx={{marginRight:'10px', color:theme.palette.primary.main}} onClick={handleReplyBoxOpen}>Reply</ActionButton>
            <ActionButton sx={{color:theme.palette.primary.main}} onClick={handleOpenDialog} >Report</ActionButton>
            {(comment.isAbleToDelete === true) && <ActionButton sx={{color:theme.palette.primary.main, marginLeft:'10px'}}  onClick={handleDelete}>Delete</ActionButton>}
          </div>
          <LikeCount sx={{marginRight:"20px", color:'#ffffff'}}>{likeCount} likes</LikeCount>
        </CommentActions>
        {(replyCount > 0) && <Button onClick={handleViewReplies} variant="text" style={{color:"#ffffff"}}>
            {viewReplies ? 'Hide Replies' : 'View Replies'} ({replyCount})
        </Button>}

        { replyBox && (
            <ReplyCard sx={{  alignItems: 'center', paddingTop:"7px",paddingBottom:"0", boxShadow: 3, borderRadius: '10px', marginBottom: '0px',position:"relative",  }}>
      
                <IconButton sx={{color:"#ffffff", backgroundColor:"#000000", position:"absolute", right:"4px", top:"4px",height:"10px", width:"10px"}} onClick={handleReplyBoxClose} >
                    <Close style={{height:"10px", width:"10px"}}/>
                </IconButton>
            <Box sx={{ flexGrow: 1,display: 'flex', alignItems: 'center',justifyItems:'center',paddingTop:'10px' }}>
            
                
                <Avatar 
                    alt={userInfo.name} 
                    src={userInfo.image?.url || userInfo.image || fallbackImage} 
                    sx={{ width: 56, height: 56, marginRight: '16px' ,}} 
                />

                <TextField
                value={commentContent}
                onChange={handleCommentChange}
                fullWidth
                placeholder="Reply here..."
                variant="standard"
                multiline
                sx={{
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 20px',
                  textTransform: 'none',
                  maxHeight: "50px",
                  overflowY: "auto",
                  color: theme.palette.text.primary,
                  fontWeight: 'normal',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
                  border: '1px solid rgba(255, 255, 255, 0.4)', // Light border for the glass effect
                  backdropFilter: 'blur(10px)', // Blur for the glass effect
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
              
                  '& .MuiOutlinedInput-root': {
                    padding: 0, // To remove the default padding for multiline TextField
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
                }}
                InputProps={{
                  notched: false,
                  style: {
                    height: "100%",
                    overflowY: "auto",
                    display: "block",
                  },
                }}
                />
            
            </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', }}>
                    <Button startIcon={<Comment sx={{height:"15px", width:"15px"}} />} sx={{ color: 'red', fontSize:'10px' }} onClick={handleCommentSubmit}>
                        Reply
                    </Button>
                </Box>
            
        </ReplyCard>
        )}

          { (viewReplies &&replyCount > 0) && (
                      <Card sx={{  alignItems: 'center', paddingTop: '10px', boxShadow: 3,  marginBottom: '10px', marginRight:"0px",marginleft:"0px" , minWidth: " 400px" , overflowX:'auto', overflowY:'auto', backgroundColor: 'transparent',  }} id="commentsReplyBox">
                          <InfiniteScroll
                                              dataLength={comments.length}
                                              next={fetchMoreComments}
                                              hasMore={hasMoreComments}
                                              loader={<CommentLoading count={2}  />}
                                              endMessage={<Box sx={{textAlign:'center', color:'#ffffff'}} >No more Replies.</Box>}
                                              scrollableTarget="commentsReplyBox"
                                              >
                                              
                                              {comments.map(comment => (
                                                <SingleCommentPerspective
                                                  key={comment._id}
                                                  comment={comment}
                                                  perspectiveId={perspectiveId}
                                                  setErrorFlag={setErrorFlag}
                                                  onRemoveComment={removeChildReply}
                                                />
                                              ))}
                                              </InfiniteScroll>
                      </Card>
                  )} 


      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
                                          <DialogTitle>Report Query</DialogTitle>
                                          <DialogContent>
                                          <DialogContentText>
                                              Please provide the reason for reporting this query.
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




SingleCommentPerspective.propTypes = {
  perspectiveId: PropTypes.string.isRequired,
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    commenterInfo: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.shape({
        url: PropTypes.string
      }),
      googleProfilePicture: PropTypes.string
    }),
    comment_content: PropTypes.string.isRequired,
    commented_at: PropTypes.string.isRequired,
    like_count: PropTypes.number,
    liked: PropTypes.bool,
    reply_count: PropTypes.number,
    isAbleToDelete: PropTypes.bool,
    is_reply: PropTypes.bool,
    set_parent_comment_reply_count : PropTypes.func,
  }).isRequired,
  setErrorFlag: PropTypes.func.isRequired,
  onRemoveComment: PropTypes.func.isRequired
};


export default SingleCommentPerspective;
