import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, Box, Button, Badge, Link , Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel} from '@mui/material';
import { Favorite, Share, Comment, MoreVert, CheckCircle, Close, Tag, HelpOutline } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useTheme } from '@emotion/react';
import EnlargedImagePreview from './EnlargedImagePreview';
import EnlargedQuery from './EnlargedQuery';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { useLikeQueryMutation, useUnlikeQueryMutation } from '../../slices/api_slices/queryApiSlice'
import { useReportPostMutation, useSavePostMutation, useUnsavePostMutation } from '../../slices/api_slices/allPostsApiSlice';
import { useSendFollowRequestMutation} from '../../slices/api_slices/peoplesApiSlice';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const reasons = [
    'Inappropriate Content',
    'Spam or Misleading',
    'Harassment or Bullying',
    'Hate Speech',
    'Violation of Community Guidelines',
  ];

const GlassmorphicCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    width: '100%',
    color: '#ffffff',
    padding: '0px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
    backdropFilter: 'blur(8px) saturate(180%)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.65)', // Slightly more opaque background
      border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
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
    position: "relative",
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

const StyledFormControlLabel = styled(FormControlLabel)(({ theme, checked }) => ({
    '& .MuiRadio-root': {
      color: checked ? "#000000" : "#545454",
      '& .MuiFormControlLabel-label': {
    color: checked ?  "#000000" : "#666633",
  },
    },
    
  }));

const QueryPostCard = React.memo(({ post, setErrorFlag }) => {


    const theme = useTheme();
    const navigate = useNavigate();
    const {fallbackImage} = useSelector(state => state.fallbackImage)
    const location = useLocation();


    const [imageOpen, setImageOpen] = useState(false);
    const [queryOpen, setQueryOpen] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState(false);
    const [followStatus, setFollowStatus] = useState(post?.followStatus);
    const [isLiked, setIsLiked] = useState(post?.isLikedByUser);
    const [likeCount, setLikeCount] = useState(post?.likeCount);
    const [commentCount, setCommentCount] = useState(post?.commentCount || 0);
    const [answerCount, setAnswerCount] = useState(post?.answerCount || 0);
    const [isSaved, setIsSaved] = useState(post?.isPostSaved || false);
    const [savedPostId, setSavedPostId] = useState( post?.savedPostId || '');

    const handleImageOpen = () => setImageOpen(true);
    const handleImageClose = () => setImageOpen(false);
    const handleQueryOpen = () => setQueryOpen(true);
    const handleQueryClose = () => setQueryOpen(false);

    const relativeTime = formatDistanceToNow(new Date(post.posted_at), { addSuffix: true });

    

    const toggleExpandDescription = () => {
        setExpandedDescription(!expandedDescription);
    };

  const maxLength = 300;
  const isLongText = post.description.length > maxLength;
  const displayDescription = expandedDescription ? post.description : `${post.description.slice(0, maxLength)}${isLongText ? '...' : ''}`;



  const [likeQueryMutation] = useLikeQueryMutation();
  const [unlikeQueryMutation] = useUnlikeQueryMutation();
  const [sendFollowRequest] = useSendFollowRequestMutation();

  const [reportPost] = useReportPostMutation();

  const[savePost] = useSavePostMutation();
  const[unsavePost] = useUnsavePostMutation();


  const handleFollow = async () => {
    try {
      const result = await sendFollowRequest({ followedUserId: post?.user?._id }).unwrap();
      if(result.success){
        setFollowStatus('pending')
      }
      
    } catch (error) {
      setErrorFlag('Failed to follow')
      console.error('Failed to send follow request:', error);
    }
  };



  const handleLike = async () => {
    try {
      await likeQueryMutation({ queryId: post._id });
      setIsLiked(true);
      setLikeCount(likeCount => likeCount + 1); // Increase like count
      console.log('Liked:', post._id); // Replace with actual logic as needed
    } catch (error) {
      console.error('Error liking query:', error);
    }
  };

  const handleUnlike = async () => {
    try {
      await unlikeQueryMutation({ queryId: post._id });
      setIsLiked(false);
      setLikeCount(likeCount => likeCount - 1); // Decrease like count
      console.log('Unliked:', post._id); // Replace with actual logic as needed
    } catch (error) {
      console.error('Error unliking query:', error);
    }
  };

  const handleSaveQuery = async()=>{
    try{

        const response = await savePost({postType : 'Query', postId : post._id})
        if(response?.data?.success){
            setIsSaved(true)
            setSavedPostId(response?.data?.savedPostId)
            handleCloseMenu()
        }
        
    }catch(error){
        console.log("error while saving the query", post._id)
    }
  }

  const handleUnsaveQuery = async()=>{
    try{
        const response = await unsavePost({ savedPostId : savedPostId})
        if(response?.data?.success){
            setIsSaved(false)
            setSavedPostId('')
            handleCloseMenu()
        }
    }catch(error){
        console.log("error in un saving the query ", post._id)
    }
  }


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
        post_type: 'query',
        post_source: 'user_profile',
        post_id: post._id
      }).unwrap();
      handleCloseDialog(); // Close the dialog after submitting the report
    } catch (err) {
      console.error('Failed to report post:', err);
      setErrorFlag('Failed to report post. Please try again.');
    }
  };

  const navigateToOtherUserProfile=() =>{
    navigate(`/profiles/${post?.user?._id}`)
  }
    
    return (
      <GlassmorphicCard>
        <CardHeader
          style={{ color: "#ffffff" }}
          avatar={
            <Avatar
              src={
                post?.user?.image?.url ||
                post?.user?.googleProfilePicture ||
                fallbackImage
              }
              sx={{ cursor: "pointer" }}
              onClick={navigateToOtherUserProfile}
            />
          }
          title={
            <Box display="flex" alignItems="center">
              <Typography
                variant="subtitle1"
                sx={{ cursor: "pointer" }}
                onClick={navigateToOtherUserProfile}
              >
                {post?.user?.name}
              </Typography>
              {/* <Typography variant="body2" component="span" sx={{ marginLeft: 1 }}>
                            <span style={{ color: 'black' }}>•</span>
                            {followStatus !== 'notFollowing' && (<span style={{ color: followStatus === 'following' ? 'blue' : 'black', cursor: 'pointer' }}>
                                {followStatus}
                            </span>)}

                            {followStatus === 'notFollowing' && (<span style={{ color: 'red', cursor: 'pointer' }} onClick={handleFollow}>
                                Follow
                            </span>)}
                        </Typography> */}

              <Typography
                variant="body2"
                component="span"
                sx={{ marginLeft: 1 }}
              >
                <span style={{ color: "black" }}>•</span>
                {followStatus !== "notFollowing" && (
                  <span
                    style={{
                      marginLeft: "10px",
                      color:
                        followStatus === "following"
                          ? "rgba(0, 0, 100, 0.8)"
                          : "(255, 255, 255, 1)",
                      cursor: "pointer",
                    }}
                  >
                    {followStatus}
                  </span>
                )}

                {followStatus === "notFollowing" && (
                  <span
                    style={{
                      color: "rgba(100,0,0, 0.8)",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                    onClick={handleFollow}
                  >
                    Follow
                  </span>
                )}
              </Typography>
            </Box>
          }
          subheader={relativeTime}
          subheaderTypographyProps={{ style: { color: "#ffffff" } }}
          action={
            <>
              <IconButton
                aria-label="settings"
                onClick={handleClickMenu}
                sx={{ color: "#ffffff" }}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleOpenDialog}>Report Query</MenuItem>
                {location.pathname !== "/profile" &&
                  (!isSaved ? (
                    <MenuItem onClick={handleSaveQuery}>Save Query</MenuItem>
                  ) : (
                    <MenuItem onClick={handleUnsaveQuery}>
                      UnSave Query
                    </MenuItem>
                  ))}
              </Menu>

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
            </>
          }
        />
        <PostContent style={{ paddingTop: "0px", marginTop: "0px" }}>
          <Box style={{ marginBottom: "10px", marginTop: "0px" }}>
            <Typography variant="h6" style={{ width: "100%" }}>
              {post.title}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="5px"
            width="100%"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="0px"
              width="100%"
            >
              <Button
                variant="outlined"
                size="small"
                style={{
                  background: "rgba(255, 255, 255, 0.65)",
                  borderRadius: "5px",
                  marginRight: "10px",
                }}
              >
                <HelpOutline style={{ color: "rgba(150, 0, 0, 0.6)" }} />
                <span style={{ color: "#000000" }}>Query</span>
              </Button>
              <Button
                variant="outlined"
                size="small"
                style={{
                  background: "rgba(255, 255, 255, 0.65)",
                  borderRadius: "5px",
                  color: "#363636",
                }}
              >
                <Tag />
                {post.topic || "Botany"}
              </Button>
            </Box>
          </Box>
          {post.image && (
            <>
              <ImageContainer onClick={handleImageOpen}>
                <ImagePreview src={post.image?.url} alt={post.title} />
              </ImageContainer>
              <EnlargedImagePreview
                open={imageOpen}
                handleClose={handleImageClose}
                imgSrc={
                  post.image?.url || post?.googleProfilePicture || fallbackImage
                }
              />
            </>
          )}
          <Box sx={{ width: "100%", minHeight: "50px" }}>
            <Typography variant="body2">
              {displayDescription}
              {isLongText && (
                <Link
                  component="button"
                  onClick={toggleExpandDescription}
                  sx={{ ml: 1, color: theme.palette.danger.main }}
                >
                  {expandedDescription ? "Show less" : "Show more"}
                </Link>
              )}
            </Typography>
          </Box>
        </PostContent>
        <PostActions
          style={{
            color: theme.palette.secondary.main,
            justifyItems: "space-around",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyItems="space-between"
            justifyContent="space-between"
          >
            <Box
              onClick={isLiked ? handleUnlike : handleLike}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                marginRight: "2rem",
                color: "#ffffff",
              }}
            >
              <IconButton
                aria-label="like"
                style={{ color: isLiked ? "red" : "inherit" }}
              >
                <Favorite />
              </IconButton>
              <Typography
                variant="body2"
                style={{ fontSize: "0.7rem", cursor: "pointer " }}
              >
                {likeCount} Likes
              </Typography>
            </Box>

            <Box
              onClick={handleQueryOpen}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                aria-label="comment"
                style={{ color: theme.palette.primary.main }}
              >
                <Comment />
              </IconButton>
              <Typography
                variant="body2"
                style={{
                  color: theme.palette.primary.main,
                  fontSize: "0.7rem",
                  cursor: "pointer ",
                }}
              >
                {commentCount} comments
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <Box
              onClick={handleQueryOpen}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                aria-label="answers"
                style={{ color: theme.palette.primary.main }}
              >
                <Badge sx={{ marginRight: 1 }}>
                  <CheckCircle />
                </Badge>
              </IconButton>
              <Typography
                variant="body2"
                style={{
                  fontSize: "0.7rem",
                  cursor: "pointer ",
                  color: "#ffffff",
                }}
              >
                {answerCount} Answers
              </Typography>
            </Box>

            {/* <Box  sx={{display:"flex" , justifyContent:"center", alignContent:"center", alignItems:"center"}}>
                            <IconButton aria-label="share" style={{ color: theme.palette.secondary.main }}>
                                <Share />
                            </IconButton>
                            <Typography variant="body2" style={{ fontSize: "0.7rem", cursor: "pointer " }}>{post.shares} shares</Typography>
                    </Box> */}
          </Box>
          <EnlargedQuery
            open={queryOpen}
            onClose={handleQueryClose}
            post={post}
            relativeTime={relativeTime}
            isLiked={isLiked}
            likeCount={likeCount}
            handleLike={handleLike}
            handleUnlike={handleUnlike}
            setErrorFlag={setErrorFlag}
            setCommentCount={setCommentCount}
            setAnswerCount={setAnswerCount}
            handleFollow={handleFollow}
            followStatus={followStatus}
            navigateToOtherUserProfile={navigateToOtherUserProfile}
            isSaved={isSaved}
            handleSaveQuery={handleSaveQuery}
            handleUnsaveQuery={handleUnsaveQuery}
          />
        </PostActions>
      </GlassmorphicCard>
    );
});


QueryPostCard.propTypes = {
    post: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        posted_at: PropTypes.string.isRequired,
        isLikedByUser: PropTypes.bool,
        likeCount: PropTypes.number,
        commentCount: PropTypes.number,
        answerCount: PropTypes.number,
        isFollowing: PropTypes.bool,
        image: PropTypes.shape({
            url: PropTypes.string
        }),
        user: PropTypes.shape({
            name: PropTypes.string.isRequired,
            image: PropTypes.shape({
                url: PropTypes.string
            }),
            googleProfilePicture: PropTypes.string
        }),
        topic: PropTypes.string
    }).isRequired,
    setErrorFlag: PropTypes.func.isRequired
};


export default QueryPostCard;
