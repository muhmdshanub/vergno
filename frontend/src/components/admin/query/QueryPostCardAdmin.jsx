import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, Box, Button, Badge, Link } from '@mui/material';
import { Favorite, Comment, CheckCircle, Tag, HelpOutline } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const PostCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: '#f0faff',
    borderRadius: '16px',
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

const QueryPostCardAdmin = React.memo(({ post }) => {
    const theme = useTheme();
    const { fallbackImage } = useSelector(state => state.fallbackImage);
    const [imageOpen, setImageOpen] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState(false);

    const handleImageOpen = () => setImageOpen(true);
    const handleImageClose = () => setImageOpen(false);

    const relativeTime = formatDistanceToNow(new Date(post?.queryData.posted_at), { addSuffix: true });

    const toggleExpandDescription = () => {
        setExpandedDescription(!expandedDescription);
    };

    const maxLength = 300;
    const isLongText = post.queryData.description.length > maxLength;
    const displayDescription = expandedDescription ? post.queryData.description : `${post.queryData.description.slice(0, maxLength)}${isLongText ? '...' : ''}`;

    return (
        <PostCard>
            <CardHeader
                avatar={<Avatar src={post?.queryData?.userInfo?.image?.url || post?.queryData?.userInfo?.googleProfilePicture || fallbackImage} />}
                title={
                    <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1">
                            {post?.queryData?.userInfo?.name}
                        </Typography>
                    </Box>
                }
                subheader={relativeTime}
            />
            <PostContent style={{ paddingTop: "0px", marginTop: "0px" }}>
                <Box style={{ marginBottom: "10px", marginTop: "0px" }}>
                    <Typography variant="h6" style={{ width: "100%" }}>{post?.queryData?.title}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="5px" width="100%">
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="0px" width="100%">
                        <Button variant="outlined" size="small" style={{ background: theme.palette.ternaryButton.main, borderRadius: '5px', marginRight: '10px' }}>
                            <HelpOutline style={{ color: "#c70039" }} />
                            <span style={{ color: "#363636" }}>Query</span>
                        </Button>
                        <Button variant="outlined" size="small" style={{ background: theme.palette.ternaryButton.main, borderRadius: '5px', color: "#363636" }}>
                            <Tag />
                            {post.topic || "Botany"}
                        </Button>
                    </Box>
                </Box>
                {post?.queryData.image && (
                    <>
                        <ImageContainer onClick={handleImageOpen}>
                            <ImagePreview src={post?.queryData?.image?.url} alt={post?.queryData.title} />
                        </ImageContainer>
                    </>
                )}
                <Box sx={{ width: "100%" }}>
                    <Typography variant="body2">
                        {displayDescription}
                        {isLongText && (
                            <Link component="button" onClick={toggleExpandDescription} sx={{ ml: 1, color: theme.palette.danger.main }}>
                                {expandedDescription ? 'Show less' : 'Show more'}
                            </Link>
                        )}
                    </Typography>
                </Box>
            </PostContent>
            <PostActions style={{ color: theme.palette.secondary.main, justifyItems: "space-around" }}>
                <Box display="flex" alignItems="center" justifyItems="space-between" justifyContent="space-between">
                    <Box sx={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center", marginRight: '2rem' }}>
                        <IconButton aria-label="like" style={{ color: "inherit" }}>
                            <Favorite />
                        </IconButton>
                        <Typography variant="body2" style={{ fontSize: "0.7rem", cursor: "pointer " }}>{post?.queryData.likeCount} Likes</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                        <IconButton aria-label="comment" style={{ color: theme.palette.secondary.main }}>
                            <Comment />
                        </IconButton>
                        <Typography variant="body2" style={{ color: theme.palette.secondary.main, fontSize: "0.7rem", cursor: "pointer " }}>{post.commentCount} comments</Typography>
                    </Box>
                </Box>
                <Box display="flex" alignItems="center">
                    <Box sx={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                        <IconButton aria-label="answers" style={{ color: theme.palette.secondary.main }}>
                            <Badge sx={{ marginRight: 1 }}>
                                <CheckCircle />
                            </Badge>
                        </IconButton>
                        <Typography variant="body2" style={{ fontSize: "0.7rem", cursor: "pointer " }}>{post?.queryData.answers} Answers</Typography>
                    </Box>
                </Box>
            </PostActions>
        </PostCard>
    );
});


QueryPostCardAdmin.propTypes = {
    post: PropTypes.shape({
        queryData: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            userInfo: PropTypes.shape({
                name: PropTypes.string.isRequired,
                image: PropTypes.shape({
                    url: PropTypes.string
                }),
                googleProfilePicture: PropTypes.string
            }),
            posted_at: PropTypes.instanceOf(Date).isRequired,
            description: PropTypes.string.isRequired,
            image: PropTypes.shape({
                url: PropTypes.string
            }),
            topic: PropTypes.string,
            likeCount: PropTypes.number.isRequired,
            commentCount: PropTypes.number.isRequired,
            answers: PropTypes.number.isRequired
        }).isRequired
    }).isRequired
};

export default QueryPostCardAdmin;
