import React, { useState, useEffect, useCallback , useRef} from 'react';
import PropTypes from 'prop-types';
import { styled, Avatar, Box,Card, CardHeader, CardContent, CardActions,TextField, Button, IconButton,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import { Comment, Close } from '@mui/icons-material';
import { useQueryReplyMutation , useLikeQueryCommentMutation, useUnlikeQueryCommentMutation, useReportCommentMutation, useGetAllCRepliesForQueryCommentQuery, useDeleteQueryCommentMutation, useDeleteQueryReplyMutation} from '../../slices/api_slices/allCommentsApiSlice.js';
import relativeTime from '../../utils/relativeTime.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import CommentLoading from '../CommentLoading.jsx';

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

const CommentContent = styled('div')(({ theme }) => ({
    width:"100%",
    padding:"12px",
    backgroundColor: theme.palette.textFieldbg.main,
    borderRadius: '10px',
    boxShadow: `inset 1px 1px 1px 1px ${theme.palette.buttonOutline.main}`,
}));

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

const SingleCommentQuery = ({queryId, comment, setErrorFlag, onRemoveComment }) => {
    const theme = useTheme();
    const [replyBox, setReplyBox] = useState(false);
    const [viewReplies, setViewreplies] = useState(false);

    const {userInfo} = useSelector(state => state.userAuth)
    const {fallbackImage} = useSelector(state => state.fallbackImage)

    const [commentContent, setCommentContent] = useState('');
    const [queryReply] = useQueryReplyMutation();

    const newCommentRef = useRef(null);

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
        const response = await queryReply({ comment_content: commentContent, parent_query_id: queryId, parent_comment_id : comment._id  }).unwrap();
        console.log('Reply added successfully:', response);
        setCommentContent(''); // Clear the input field after successful submission
        setReplyBox(false)

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

    const [likeQueryCommentMutation] = useLikeQueryCommentMutation();
    const [unlikeQueryCommentMutation] = useUnlikeQueryCommentMutation();


    const handleLike = async () => {
      try {
        
        await likeQueryCommentMutation({ comment_id: comment._id });
        setIsLiked(true);
        setLikeCount(likeCount => likeCount + 1); // Increase like count
        console.log('Liked:', comment._id); // Replace with actual logic as needed
      } catch (error) {
        console.error('Error liking query comment:', error);
      }
    };
  
    const handleUnlike = async () => {
      try {
        await unlikeQueryCommentMutation({ comment_id: comment._id });
        setIsLiked(false);
        setLikeCount(likeCount => likeCount - 1); // Decrease like count
        console.log('Unliked:', comment._id); // Replace with actual logic as needed
      } catch (error) {
        console.error('Error unliking query comment:', error);
      }
    };

    //report coment

    const [openDialog, setOpenDialog] = useState(false);
    const [reason, setReason] = useState('');

    const [reportComment] = useReportCommentMutation();


    const handleOpenDialog = () => {
        setOpenDialog(true);
       
      };

      const handleCloseDialog = () => {
        setOpenDialog(false);
        setReason(''); // Reset reason when closing the dialog
        setErrorFlag('')
      };


      const handleSubmitReport = async () => {
        if (reason.trim() === '' || reason.length > 100) {
          setErrorFlag('Reason must be provided and less than 100 characters.');
          return;
        }
      
        try {
          await reportComment({
            reason,
            comment_type: 'queryComment',
            comment_source: 'user_profile',
            comment_id: comment._id
          }).unwrap();
          handleCloseDialog(); // Close the dialog after submitting the report
        } catch (err) {
          console.error('Failed to report comment:', err);
          setErrorFlag('Failed to report comment. Please try again.');
        }
      };


  //fetching comments all

const [comments, setComments] = useState([]);
const [tempComments, setTempComments] = useState([]);
const [commentsPage, setCommentsPage] = useState(1);
const [hasMoreComments, setHasMoreComments] = useState(true);

const { data : commentsData, error : commentsError, isLoading : isCommentsLoading, isSuccess : isCommentsSuccess,isError : isCommentsError, refetch : refetchComments } = useGetAllCRepliesForQueryCommentQuery(
  { query_comment_id : comment._id, page : commentsPage, limit : '10' },
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

const removeChildReply = (commentId) =>{
  setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
}


//delete comment and reply

const [deleteQueryComment] = useDeleteQueryCommentMutation();
const [deleteQueryReply] = useDeleteQueryReplyMutation();


const handleDeleteComment = async () => {
  try {
    
      const result = await deleteQueryComment({ comment_id: comment._id }).unwrap();
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
    
      const result = await deleteQueryReply({ reply_id: commentId }).unwrap();
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
      <Box style={{width:'100%',}}>
        <CommentContent>
            <strong style={{cursor:"pointer"}}>{comment?.commenterInfo?.name}</strong>
            <CommentText>{comment.comment_content}</CommentText>
            
        </CommentContent>
        <CommentActions>
          <div style={{display:'flex',justifyContent: 'space-between',alignItems:"center", paddingLeft:"10px", color:theme.palette.secondary.main}}>
            <span style={{marginRight:'10px'}}>{relativeTime(comment.commented_at)}</span>
            <ActionButton sx={{marginRight:'10px', color:theme.palette.secondary.main, marginLeft:'10px'}} onClick={isLiked ? handleUnlike : handleLike}>{isLiked ? "unlike" : "like" }</ActionButton>
            <ActionButton sx={{marginRight:'10px', color:theme.palette.secondary.main}} onClick={handleReplyBoxOpen}>Reply</ActionButton>
            <ActionButton sx={{color:theme.palette.secondary.main}} onClick={handleOpenDialog}>Report</ActionButton>
            {(comment.isAbleToDelete === true) && <ActionButton sx={{color:theme.palette.secondary.main, marginLeft:'10px'}} onClick={handleDelete}>Delete</ActionButton>}
          </div>
          <LikeCount sx={{marginRight:"20px"}}>{likeCount} likes</LikeCount>
        </CommentActions>
        <Button onClick={handleViewReplies} variant="text" style={{color:"#000000"}}>
            {viewReplies ? 'Hide Replies' : 'View Replies'} ({comment.reply_count})
        </Button>

        { replyBox && (
            <Card sx={{  alignItems: 'center', paddingTop:"7px",paddingBottom:"0", boxShadow: 3, borderRadius: '10px', marginBottom: '0px',position:"relative", backgroundColor: 'rgba(0,0,0, 0.71)',
              backdropFilter: 'blur(6px) saturate(200%)',
              WebkitBackdropFilter: 'blur(6px) saturate(200%)',
              border: '1px solid rgba(209, 213, 219, 0.6)', 
              transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',  }}>
      
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
                    backgroundColor: theme.palette.textFieldbg.main,
                    borderRadius: '25px',
                    borderColor:theme.palette.textFieldbg.main,
                    boxShadow: `inset 1px 1px ${theme.palette.buttonOutline.main}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 20px',
                    textTransform: 'none',
                    maxHeight:"60px",
                    overflowY:"auto",
                    color: theme.palette.text.primary,
                    fontWeight: 'normal',
                    '&:hover': {
                    backgroundColor: theme.palette.textFieldbgEnhanced.main, 
                    },
                }}
                InputProps={{
                    notched: false,
                }}
                />
            
            </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', }}>
                    <Button startIcon={<Comment sx={{height:"15px", width:"15px"}} />} sx={{ color: 'red', fontSize:'10px' }} onClick={handleCommentSubmit}>
                        Reply
                    </Button>
                </Box>
            
        </Card>
        )}

         { viewReplies && (
            <Card sx={{  alignItems: 'center', paddingTop: '10px', boxShadow: 3,  marginBottom: '10px', marginRight:"0px",marginleft:"0px" , width: " 400px" , overflowX:'auto', overflowY:'auto', backgroundColor: 'transparent',backdropFilter: 'blur(6px) saturate(200%)',WebkitBackdropFilter: 'blur(6px) saturate(200%)',border: '1px solid rgba(209, 213, 219, 0.6)',transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', }} id="commentsReplyBox">
                    <InfiniteScroll
                                              dataLength={comments.length}
                                              next={fetchMoreComments}
                                              hasMore={hasMoreComments}
                                              loader={<CommentLoading count={2} />}
                                              endMessage={<Box>No more Replies.</Box>}
                                              scrollableTarget="commentsReplyBox"
                                              >
                                              
                                              {comments.map(comment => (
                                                <SingleCommentQuery
                                                  key={comment._id}
                                                  comment={comment}
                                                  queryId={queryId}
                                                  setErrorFlag={setErrorFlag}
                                                  onRemoveComment={removeChildReply}
                                                />
                                              ))}
                                              </InfiniteScroll>
            </Card>
        )} 

      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
                                          <DialogTitle>Report Comment</DialogTitle>
                                          <DialogContent>
                                          <DialogContentText>
                                              Please provide the reason for reporting this comment.
                                          </DialogContentText>
                                          <TextField
                                              autoFocus
                                              margin="dense"
                                              label="Reason"
                                              type="text"
                                              fullWidth
                                              variant="outlined"
                                              value={reason}
                                              onChange={(e) => setReason(e.target.value)}
                                          />
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


SingleCommentQuery.propTypes = {
  queryId: PropTypes.string.isRequired,
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    comment_content: PropTypes.string.isRequired,
    commented_at: PropTypes.string.isRequired,
    commenterInfo: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.shape({
        url: PropTypes.string
      }),
      googleProfilePicture: PropTypes.string
    }).isRequired,
    like_count: PropTypes.number.isRequired,
    liked: PropTypes.bool.isRequired,
    reply_count: PropTypes.number.isRequired,
    isAbleToDelete: PropTypes.bool.isRequired,
    is_reply: PropTypes.bool
  }).isRequired,
  setErrorFlag: PropTypes.func.isRequired,
  onRemoveComment: PropTypes.func.isRequired
};



export default SingleCommentQuery;
