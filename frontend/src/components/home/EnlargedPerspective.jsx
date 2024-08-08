import React,{useState, useEffect, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardActions, Avatar,   AppBar, Toolbar, Typography, IconButton, Box,   Button, Modal,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Menu, MenuItem, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@mui/material';
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
import { useLocation } from 'react-router-dom';



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
    backgroundColor: 'rgba(200, 200, 200, 0.75)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
};

const StyledModal = styled(Modal)(({ theme }) => ({ // Use destructuring to access the theme
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
       
  }));

  const GlassmorphicAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
    backdropFilter: 'blur(6px) saturate(150%)', // Blur and saturate for the glass effect
    WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3], // Subtle shadow for depth
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius:"10px 10px 0px 0px"
    
  }));

  const GlassmorphicBox = styled(Box)(({theme})=>({
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(6px) saturate(150%)',
    WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    ...scrollBarStyles
    
  }))

  const PostCard = styled(Card)(({ theme }) => ({
    marginTop:theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxWidth: '100%',
    color: '#ffffff',
    padding: '0px',
    backgroundColor:'transparent',
    boxShadows : theme.shadows[6],
    margin:'20px 10px 20px 10px'
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
    marginBottom: '10px',
    backgroundColor:'transparent',
    boxShadow: theme.shadows[3],
    margin:'10px',
    minHeight:'200px'

  }))

  const GlassmorphicCardCommentInput = styled(Card)(({theme})=>({
  
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



const EnlargedPerspective = React.memo(({ open, onClose, post, relativeTime,  isLiked, likeCount ,handleLike,handleUnlike,
  setErrorFlag, setCommentCount, followStatus, handleFollow ,
   navigateToOtherUserProfile, isSaved, handleSavePerspective,handleUnsavePerspective, }) => {

  const theme = useTheme();
  const {userInfo} = useSelector(state => state.userAuth)
  const {fallbackImage} = useSelector(state => state.fallbackImage)
  const location = useLocation();


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
const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');


const handleOpenDialog = () => {
    setOpenDialog(true);
    handleCloseMenu(); // Close the menu when opening the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCustomReason(''); // Reset reason when closing the dialog
    setSelectedReason('')
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
    await reportPost({
      reason : reportReason,
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
        
          <Box  sx={{borderRadius:'20px',width: {
              xs: '500px', 
              sm: '500px',
              md: '500px',
              lg: '600px', 
              xl: '700px' 
            } , position:'relative'}}>
              
          <GlassmorphicAppBar position="sticky" style={{borderRadius:"10px 10px 0px 0px",  }}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, color:'#ffffff' }}>
                  {post.user.name}'s Perspective
                </Typography>
                <IconButton edge="end" color="inherit" aria-label="close" onClick={onClose} sx={{color:'#ffffff'}}>
                  <Close />
                </IconButton>
              </Toolbar>
          </GlassmorphicAppBar>

          <GlassmorphicBox style={{width:"100%", margin:'0', maxHeight:'60vh', overflowY:'auto'}} id="commentsModal">
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
                            {followStatus !== 'notFollowing' && (<span style={{ marginLeft:'10px', color: followStatus === 'following' ? 'rgba(0, 0, 100, 0.8)' : '(255, 255, 255, 1)', cursor: 'pointer' }}>
                                {followStatus}
                            </span>)}

                            {followStatus === 'notFollowing' && (<span style={{ color: 'rgba(100,0,0, 0.8)', cursor: 'pointer' , marginLeft:'10px'}} onClick={handleFollow}>
                                Follow
                            </span>)}
                        </Typography>
                  </Box>
              }
              subheader={relativeTime}
              subheaderTypographyProps={{ style: { color: '#ffffff' } }}
              action={
                  <>
                      <IconButton aria-label="settings" onClick={handleClickMenu} sx={{color:'#ffffff'}}>
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
                          { (location.pathname !== '/profile') && ( (!isSaved) ? (
                                <MenuItem onClick={handleSavePerspective}>Save Perspective</MenuItem>
                                ) : (
                                <MenuItem onClick={handleUnsavePerspective}>UnSave Perspective</MenuItem> 
                                )
                            )}
                      </Menu>

                      <Dialog open={openDialog} onClose={handleCloseDialog}>
                          <DialogTitle>Report Perspective</DialogTitle>
                          <DialogContent>
                  <DialogContentText>
                    Please provide the reason for reporting this perspective.
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
                      
                  </>
              }
          />
          <PostContent>
                  <Box style={{marginBottom:"10px", marginTop:"0px"}}>
                      <Typography variant="h6" style={{width:"100%"}}>{post.title}</Typography>
                  </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="5px">
                  
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0px" width="100%">
                      <Button variant="outlined" size="small" style={{ background: 'rgba(255, 255, 255, 0.65)', borderRadius: '5px', marginRight: '10px' }}>
                          <Lightbulb style={{ color: 'rgba(0, 150,0, 0.6)' }} />
                          <span style={{ color: "#363636" }}>perspective</span>
                      </Button>
                      <Button variant="outlined" size="small" style={{ background: 'rgba(255, 255, 255, 0.65)', borderRadius: '5px', color: "#363636" }}>
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
                                            endMessage={<Box sx={{textAlign:'center', color:'#ffffff'}}>No more comments</Box>}
                                            scrollableTarget="commentsModal"
                                            >
                                            
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

          </GlassmorphicBox>
      
          
          {/* comment box here */}

          <GlassmorphicCardCommentInput sx={{  alignItems: 'center', padding: '10px 10px 5px 5px', boxShadow: 3, borderRadius: '2px', marginBottom: '0px',
              }}>
    
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
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 20px',
                      textTransform: 'none',
                      maxHeight: "80px",
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' , marginRight:"40px"}} onClick={handleCommentSubmit}>
                  <Button startIcon={<Comment />} sx={{ color: 'rgba(200,0,0, 1)' }} >
                      Comment
                  </Button>
                  
                  </Box>
              
          </GlassmorphicCardCommentInput>

          </Box>
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
  isSaved: PropTypes.bool.isRequired,
  handleSavePerspective: PropTypes.func.isRequired,
  handleUnsavePerspective: PropTypes.func.isRequired,
};

export default EnlargedPerspective;

