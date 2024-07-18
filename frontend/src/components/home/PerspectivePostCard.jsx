import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Menu, MenuItem} from '@mui/material';
import { Favorite, Share, Comment, MoreVert, Close, Tag } from '@mui/icons-material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { styled } from '@mui/system';
import { useTheme } from '@emotion/react';
import EnlargedImagePreview from './EnlargedImagePreview';

import EnlargedPerspective from './EnlargedPerspective';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { useLikePerspectiveMutation, useUnlikePerspectiveMutation } from '../../slices/api_slices/perspectiveApiSlice'
import { useReportPostMutation } from '../../slices/api_slices/allPostsApiSlice';
import { useSendFollowRequestMutation} from '../../slices/api_slices/peoplesApiSlice';
import { useNavigate } from 'react-router-dom';



const PostCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: '#f0faff',
    borderRadius: '16px',
}));


const GlassmorphicCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    width: '100%',
    color: '#000000',
    padding: '0px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
    backdropFilter: 'blur(10px) saturate(200%)',
    WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
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

const PerspectivePostCard = React.memo(({ post, setErrorFlag }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const {fallbackImage} = useSelector(state => state.fallbackImage)

    const [imageOpen, setImageOpen] = useState(false);
    const [perspectiveOpen, setPerspectiveOpen] = useState(false);

    const [expandedDescription, setExpandedDescription] = useState(false);
    const [isLiked, setIsLiked] = useState(post?.isLikedByUser);
    const [followStatus, setFollowStatus] = useState(post?.followStatus);
    const [likeCount, setLikeCount] = useState(post?.likeCount);
    const [commentCount, setCommentCount] = useState(post?.commentCount || 0)


    const handleImageOpen = () => setImageOpen(true);
    const handleImageClose = () => setImageOpen(false);
    const handlePerspectiveOpen = () => setPerspectiveOpen(true);
    const handlePerspectiveClose = () => setPerspectiveOpen(false);

    const relativeTime = formatDistanceToNow(new Date(post.posted_at), { addSuffix: true });

    

    const toggleExpandDescription = () => {
        setExpandedDescription(!expandedDescription);
    };

    const maxLength = 300;
    const isLongText = post.description.length > maxLength;
    const displayDescription = expandedDescription ? post.description : `${post.description.slice(0, maxLength)}${isLongText ? '...' : ''}`;



    const [likePerspectiveMutation] = useLikePerspectiveMutation();
    const [unlikePerspectiveMutation] = useUnlikePerspectiveMutation();
    const [sendFollowRequest] = useSendFollowRequestMutation();
  


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
      await likePerspectiveMutation({ perspectiveId: post._id });
      setIsLiked(true);
      setLikeCount(likeCount => likeCount + 1); // Increase like count
      
    } catch (error) {
      console.error('Error liking perspective:', error);
    }
  };

  const handleUnlike = async () => {
    try {
      await unlikePerspectiveMutation({ perspectiveId: post._id });
      setIsLiked(false);
      setLikeCount(likeCount => likeCount - 1); // Decrease like count
      
    } catch (error) {
      console.error('Error unliking perspective:', error);
    }
  };


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

const navigateToOtherUserProfile=() =>{
    navigate(`/profiles/${post?.user?._id}`)
  }


    return (
        <GlassmorphicCard>
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
                            <LightbulbIcon style={{ color: "#32de84" }} />
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

                    <Box onClick={handlePerspectiveOpen}  sx={{display:"flex" , justifyContent:"center", alignContent:"center", alignItems:"center"}}>   
                        <IconButton aria-label="comment"  style={{ color: theme.palette.secondary.main }}>
                            <Comment />
                        </IconButton>
                        <Typography variant="body2" style={{ color: theme.palette.secondary.main, fontSize: "0.7rem", cursor: "pointer " }}>{commentCount} comments</Typography>
                    </Box>
                    </Box>
                {/* <Box display="flex" alignItems="center">
                    <IconButton aria-label="share" style={{ color: theme.palette.secondary.main }}>
                        <Share />
                    </IconButton>
                    <Typography variant="body2" style={{ fontSize: "0.7rem" }}>{post.shares} shares</Typography>
                </Box> */}
                <EnlargedPerspective open={perspectiveOpen} onClose={handlePerspectiveClose} post={post} relativeTime={relativeTime}  isLiked={isLiked} likeCount={likeCount} handleLike={handleLike} handleUnlike={handleUnlike} setErrorFlag={setErrorFlag} setCommentCount={setCommentCount} handleFollow={handleFollow} followStatus={followStatus} navigateToOtherUserProfile={navigateToOtherUserProfile}/>
            </PostActions>
        </GlassmorphicCard>
    );
});


PerspectivePostCard.propTypes = {
    post: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.shape({
        url: PropTypes.string.isRequired,
      }),
      user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        image: PropTypes.shape({
          url: PropTypes.string,
        }),
        googleProfilePicture: PropTypes.string,
      }),
      isLikedByUser: PropTypes.bool,
      likeCount: PropTypes.number,
      commentCount: PropTypes.number,
      posted_at: PropTypes.string.isRequired,
      isFollowing: PropTypes.bool,
      topic: PropTypes.string,
    }).isRequired,
    setErrorFlag: PropTypes.func.isRequired,
  };



export default PerspectivePostCard;
