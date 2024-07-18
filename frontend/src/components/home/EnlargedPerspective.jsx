import React,{useState, useEffect, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardActions, Avatar,   AppBar, Toolbar, Typography, IconButton, Box,   Button, Modal,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Menu, MenuItem } from '@mui/material';
import { styled, ThemeProvider, useTheme } from '@mui/system'; // Import ThemeProvider

import {MoreVert, HelpOutline, Tag, Favorite, Share, CheckCircle, Comment, Lightbulb,Close} from '@mui/icons-material'
import EnlargedImagePreview from './EnlargedImagePreview.jsx';
import { useSelector } from 'react-redux';
import { useReportPostMutation } from '../../slices/api_slices/allPostsApiSlice.js';
import { usePerspectiveCommentMutation } from '../../slices/api_slices/allCommentsApiSlice.js';
import { useGetAllCommentsForPerspectiveQuery } from '../../slices/api_slices/allCommentsApiSlice.js';
import SingleCommentPerspective from './SingleCommentPerspective.jsx';
import LoadingModal from '../LoadingModal.jsx';
import InfiniteScroll from 'react-infinite-scroll-component';
import CommentLoading from '../CommentLoading.jsx';



const StyledModal = styled(Modal)(({ theme }) => ({ // Use destructuring to access the theme
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
       
  }));

  const PostCard = styled(Card)(({ theme }) => ({
    marginTop:theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
    color: '#000000',
    padding: '0px',
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Semi-transparent background
    backdropFilter: 'blur(6px) saturate(200%)',
    WebkitBackdropFilter: 'blur(6px) saturate(200%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.6)', // Semi-transparent border
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.75)', // Slightly more opaque background
      border: '1px solid rgba(209, 213, 219, 0.7)', // Slightly more opaque border
      boxShadow: theme.shadows[6], // Increase box shadow on hover
    },
  }));
  
  const PostContent = styled(CardContent)(({ theme }) => ({
    paddingBottom: theme.spacing(2),
  }));
  
  const ImageContainer = styled(Box)({
      width: '100%',
      height: '200px',
      backgroundColor: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '10px',
      marginBottom: '10px',
      position:"relative",
    });
    
    const ImagePreview = styled('img')({
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    });
  
  
  const PostActions = styled(CardActions)(({ theme }) => ({
    justifyContent: 'space-between',
    padding: `0 ${theme.spacing(2)}px ${theme.spacing(2)}px`,
  }));

  const CommentBox = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    margin: theme.spacing(2, 0),
  }));
  
  const CommentInput = styled(TextField)({
    flexGrow: 1,
  });

  const CommentButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(1),
  }));

  const CommentContainerCard = styled(Card)(({ theme }) =>({
    alignItems: 'center', 
    paddingTop: '10px', 
    boxShadow: 3,  
    marginBottom: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Semi-transparent background
    backdropFilter: 'blur(6px) saturate(200%)',
    WebkitBackdropFilter: 'blur(6px) saturate(200%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.6)', // Semi-transparent border
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition

  }))


const EnlargedPerspective = React.memo(({ open, onClose, post, relativeTime,  isLiked, likeCount ,handleLike,handleUnlike, setErrorFlag, setCommentCount, followStatus, handleFollow , navigateToOtherUserProfile}) => {

  const theme = useTheme();
  const {userInfo} = useSelector(state => state.userAuth)
  const {fallbackImage} = useSelector(state => state.fallbackImage)

  const [imageOpen, setImageOpen] = useState(false);
  const [selectType, setSelectType] = useState("comments");
  const [expandedDescription, setExpandedDescription] = useState(false);

  const handleImageOpen = () => setImageOpen(true); 
  const handleImageClose = () => setImageOpen(false); 


  const newCommentRef = useRef(null);

  const handleSelctType = (e) => {
      setSelectType(e.target.value)
  }

      

  const toggleExpandDescription = () => {
    setExpandedDescription(!expandedDescription);
};

const maxLength = 300;
const isLongText = post.description.length > maxLength;
const displayDescription = expandedDescription ? post.description : `${post.description.slice(0, maxLength)}${isLongText ? '...' : ''}`;



const [reportPost] = useReportPostMutation();


const [anchorEl, setAnchorEl] = useState(null);
const [openMenu, setOpenMenu] = useState(false);
const [openDialog, setOpenDialog] = useState(false);
const [reason, setReason] = useState('');


const handleOpenDialog = () => {
    setOpenDialog(true);
    handleCloseMenu(); // Close the menu when opening the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReason(''); // Reset reason when closing the dialog
    setErrorFlag('')
  };



const handleClickMenu = (event) => {
setAnchorEl(event.currentTarget);
setOpenMenu(true);
};

const handleCloseMenu = () => {
setAnchorEl(null);
setOpenMenu(false);
};

const handleSubmitReport = async () => {
if (reason.trim() === '' || reason.length > 100) {
  setErrorFlag('Reason must be provided and less than 100 characters.');
  return;
}

try {
  await reportPost({
    reason,
    post_type: 'perspective',
    post_source: 'user_profile',
    post_id: post._id
  }).unwrap();
  handleCloseDialog(); // Close the dialog after submitting the report
} catch (err) {
  console.error('Failed to report post:', err);
  setErrorFlag('Failed to report post. Please try again.');
}
};


  const [commentContent, setCommentContent] = useState('');
  const [perspectiveComment] = usePerspectiveCommentMutation();

  const handleCommentChange = (event) => {
    setCommentContent(event.target.value);
  };

  const handleCommentSubmit = async () => {
    // Validate comment content
    if (typeof commentContent !== 'string' || commentContent.trim().length === 0 || commentContent.length > 500) {
      setErrorFlag("invalid comment format.")
      return;
    }

    try {
      // Call the queryComment mutation
      const response = await perspectiveComment({ comment_content: commentContent, parent_perspective_id: post._id }).unwrap();
      console.log('Comment added successfully:', response);
      setCommentContent(''); // Clear the input field after successful submission
      setCommentCount(prev => prev + 1)

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

    
    } catch (error) {
      console.error('Failed to add comment:', error);
      setErrorFlag('Failed to add comment:', JSON.stringify(error))
    }
  };


  //fetching comments all

const [comments, setComments] = useState([]);
const [tempComments, setTempComments] = useState([]);
const [commentsPage, setCommentsPage] = useState(1);
const [hasMoreComments, setHasMoreComments] = useState(true);

const { data : commentsData, error : commentsError, isLoading : isCommentsLoading, isSuccess : isCommentsSuccess,isError : isCommentsError, refetch : refetchComments } = useGetAllCommentsForPerspectiveQuery(
  { perspective_id : post._id, page : commentsPage, limit : '10' },
);

useEffect(() => {
  if (commentsData && isCommentsSuccess === true) {
    if (commentsPage === 1) {
      
      setComments(commentsData?.comments || []);
      setCommentsPage((prevPage) => prevPage + 1);
      refetchComments();
    } else {
      setTempComments(commentsData?.comments || []);
    }
    setHasMoreComments((commentsData?.comments || []).length > 0);
  }
  
}, [ commentsData, refetchComments]);

useEffect(()=>{
  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
    setErrorFlag(JSON.stringify(commentsError?.data?.message || commentsError?.message) || 'Error fetching comments');
  }
}, [isCommentsError])



const fetchMoreComments = () =>{

  

   setComments(prevComments => [...prevComments, ...tempComments]);
   if(!isCommentsLoading){
     setCommentsPage(prevPage => prevPage + 1);
     refetchComments();
   }
   
}


const handleRemoveComment = (commentId) => {
  setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
  setCommentCount(prev => prev - 1)
};


  return (
    <ThemeProvider theme={theme}> {/* Wrap your components with ThemeProvider */}
      <StyledModal open={open} onClose={onClose} sx={{minWidth: 'fit-content' }} >
        
          <div  style={{backgroundImage: 'linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%)',borderRadius:'20px', width:'500px', position:'relative'}}>
          <AppBar position="sticky" style={{borderRadius:"10px 10px 0px 0px",  backgroundColor: 'rgba(0, 0, 0, 0.8)',backdropFilter: 'blur(5px) saturate(150%)',WebkitBackdropFilter: 'blur(5px) saturate(150%)',}}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, color:'#ffffff' }}>
                  {post.user.name}'s Perspective
                </Typography>
                <IconButton edge="end" color="inherit" aria-label="close" onClick={onClose} sx={{color:'#ffffff'}}>
                  <Close />
                </IconButton>
              </Toolbar>
          </AppBar>

          <div style={{width:"100%", margin:'0', maxHeight:'60vh', overflowY:'auto'}} id="commentsModal">
          <PostCard>
          <CardHeader
              avatar={<Avatar src={post?.user?.image?.url || post?.user?.googleProfilePicture || fallbackImage} sx={{cursor:'pointer'}} onClick={navigateToOtherUserProfile} />}
              title={
                  <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" sx={{cursor:'pointer'}} onClick={navigateToOtherUserProfile}>
                          {post?.user?.name}
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ marginLeft: 1 }}>
                          <span style={{ color: 'black' }}>•</span>
                          {followStatus !== 'notFollowing' && (<span style={{ color: followStatus === 'following' ? 'blue' : 'black', cursor: 'pointer' }}>
                                {followStatus}
                            </span>)}

                            {followStatus === 'notFollowing' && (<span style={{ color: 'red', cursor: 'pointer' }} onClick={handleFollow}>
                                Follow
                            </span>)}
                      </Typography>
                  </Box>
              }
              subheader={relativeTime}
              action={
                  <>
                      <IconButton aria-label="settings" onClick={handleClickMenu}>
                          <MoreVert />
                      </IconButton>
                      <Menu
                          anchorEl={anchorEl}
                          open={openMenu}
                          onClose={handleCloseMenu}
                          anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                          }}
                          transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                          }}
                      >
                          <MenuItem onClick={handleOpenDialog}>Report Perspective</MenuItem>
                      </Menu>

                      <Dialog open={openDialog} onClose={handleCloseDialog}>
                          <DialogTitle>Report Perspective</DialogTitle>
                          <DialogContent>
                          <DialogContentText>
                              Please provide the reason for reporting this perspective.
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
                      
                  </>
              }
          />
          <PostContent>
                  <Box style={{marginBottom:"10px", marginTop:"0px"}}>
                      <Typography variant="h6" style={{width:"100%"}}>{post.title}</Typography>
                  </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="5px">
                  
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0px" width="100%">
                      <Button variant="outlined" size="small" style={{ background: theme.palette.ternaryButton.main, borderRadius: '5px', marginRight: '10px' }}>
                          <Lightbulb style={{ color: "#32de84" }} />
                          <span style={{ color: "#363636" }}>perspective</span>
                      </Button>
                      <Button variant="outlined" size="small" style={{ background: theme.palette.ternaryButton.main, borderRadius: '5px', color: "#363636" }}>
                          <Tag />
                          {post.topic || "Topic"}
                      </Button>
                  </Box>
              </Box>
              {post.image && (
                  <>
                      <ImageContainer onClick={handleImageOpen}>
                          <ImagePreview src={post.image.url} alt={post.title} />
                      </ImageContainer>
                      <EnlargedImagePreview open={imageOpen} handleClose={handleImageClose} imgSrc={post.image.url} />
                  </>
              )}
              <Box sx={{width:"100%"}}>
                  <Typography variant="body2">
                          {displayDescription}
                          {isLongText && (
                          <Link component="button" onClick={toggleExpandDescription} sx={{ ml: 1, color:theme.palette.danger.main }}>
                              {expandedDescription ? 'Show less' : 'Show more'}
                          </Link>
                          )}
                  </Typography>
              </Box>
          </PostContent>
          <PostActions>
          <Box display="flex" alignItems="center" justifyItems="space-between" justifyContent="space-between">

                  <Box onClick={isLiked ? handleUnlike : handleLike}   sx={{display:"flex" , justifyContent:"center", alignContent:"center", alignItems:"center", marginRight:'2rem'}}>
                      <IconButton aria-label="like"  style={{ color: isLiked ? "red" : "inherit" }}>
                          <Favorite />
                      </IconButton>
                      <Typography variant="body2" style={{ fontSize: "0.7rem", cursor: "pointer " }}>{likeCount} Likes</Typography>
                  </Box>

                  
                  </Box>
              {/* <Box display="flex" alignItems="center">
                  <IconButton aria-label="share" style={{ color: theme.palette.secondary.main }}>
                      <Share />
                  </IconButton>
                  <Typography variant="body2" style={{ fontSize: "0.7rem" }}>{post.shares} shares</Typography>
              </Box> */}
              
          </PostActions>
      </PostCard>

                  

                  {/* Testing the comment display */}
                  <CommentContainerCard  id="outerCard">
                          {

                                            <InfiniteScroll
                                            dataLength={comments.length}
                                            next={fetchMoreComments}
                                            hasMore={hasMoreComments}
                                            loader={<CommentLoading count={4}  />}
                                            endMessage={<Box>No more comments</Box>}
                                            scrollableTarget="commentsModal"
                                            >
                                            {comments.length === 0 && !isCommentsLoading && (
                                              <Box>No comments yet</Box>
                                            )}
                                            {comments.map(comment => (
                                              <SingleCommentPerspective
                                                key={comment._id}
                                                comment={comment}
                                                perspectiveId={post._id}
                                                setErrorFlag={setErrorFlag}
                                                onRemoveComment={handleRemoveComment}
                                              />
                                            ))}
                                            </InfiniteScroll>
                          }
                  </CommentContainerCard>

          </div>
      
          
          {/* comment box here */}

          <Card sx={{  alignItems: 'center', padding: '10px 10px 5px 5px', boxShadow: 3, borderRadius: '10px', marginBottom: '0px',backgroundColor: 'rgba(0,0,0, 0.1)',
              backdropFilter: 'blur(6px) saturate(200%)',
              WebkitBackdropFilter: 'blur(6px) saturate(200%)',
              border: '1px solid rgba(209, 213, 219, 0.6)', }}>
    
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
                  placeholder="Add a comment..."
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
                      maxHeight:"80px",
                      overflowY:"auto",
                      color: theme.palette.text.primary,
                      fontWeight: 'normal',
                      '&:hover': {
                      backgroundColor: theme.palette.textFieldbgEnhanced.main, 
                      },
                  }}
                  InputProps={{
                      notched: 'false',
                  }}
                  />
              
              </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' , marginRight:"40px"}} onClick={handleCommentSubmit}>
                  <Button startIcon={<Comment />} sx={{ color: 'red' }} >
                      Comment
                  </Button>
                  
                  </Box>
              
          </Card>

          </div>
      {/* <AppBar position="static" style={{height:'20px', backgroundColor:'#ffff', minWidth:'100%', bottom:'0', overflowY: 'hidden'}}> Hi </AppBar> */}
          
        
      </StyledModal>
    </ThemeProvider>
  );
});


EnlargedPerspective.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
  relativeTime: PropTypes.string.isRequired,
  isLiked: PropTypes.bool.isRequired,
  likeCount: PropTypes.number.isRequired,
  handleLike: PropTypes.func.isRequired,
  handleUnlike: PropTypes.func.isRequired,
  setErrorFlag: PropTypes.func.isRequired,
  setCommentCount: PropTypes.func.isRequired,
};

export default EnlargedPerspective;

