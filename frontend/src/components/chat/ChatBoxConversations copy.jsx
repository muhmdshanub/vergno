import React,{useState, useEffect} from 'react';
import { Box, Card, CardContent, TextField, Typography, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CircleIcon from '@mui/icons-material/Circle';
import MessageInput from './MessageInput';
import TypingIndicator from './MessageTypingIndicator';
import SentMessage from './SentMessage';
import ReceivedMessage from './ReceivedMessage';
import { useCheckCanSendMessageQuery, useSendMessageMutation , useGetAllMessagesForConversationQuery } from '../../slices/api_slices/messagesApiSlice';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import GradientCircularProgress from '../GradientCircularProgress';
import InfiniteScroll from 'react-infinite-scroll-component';
import relativeTime from '../../utils/relativeTime';


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


const GlassmorphicChatboxCard = styled(Card)(({ theme }) => ({
  height: '80vh',
  display: 'flex', 
  flexDirection: 'column',
  backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent background
  backdropFilter: 'blur(8px) saturate(200%)',
  WebkitBackdropFilter: 'blur(8px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
}));

const GlassmorphicAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.25)', // Semi-transparent background
  backdropFilter: 'blur(8px) saturate(200%)',
  WebkitBackdropFilter: 'blur(8px) saturate(200%)', // For Safari support
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
}));

const ChatBoxConversation = ({
  handleConversationClick,
  selectedConversationData, 
  setSelectedConversationData,
  messageInput, 
  setMessageInput, 
  selectedConversationsMessages, 
  setSelectedConversationsMessages, 
  selectedConversationsMessagesTemp , 
  setSelectedConversationsMessagesTemp,
  setExistingConversations,
  setNewConversations,
  newConversations,
  isInitialFetchForMessages,
  setIsInitialFetchForMessages,

  }) => {
  
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messagesPage, setMessagesPage] = useState(1)
  const [messagesPageMax, setMessagesPageMax] = useState(1)
  const [messagesPageMin, setMessagesPageMin] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [hasMoreUnreadMessages, setHasMoreUnreadMessages] = useState(false);
  const [messagesScrollType, setMessagesScrollType] = useState('upward')


  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const { data : canSendMessageData, isSuccess : canSendMessageSuccess, refetch : refetchCanSendMessage } = useCheckCanSendMessageQuery({recipientId : selectedConversationData?.userId}, { skip: selectedConversationData === null });

  const [sendMessage, { isLoading: isSending, isSuccess: sendSuccess, data: sendMessageData }] = useSendMessageMutation();
 
    // get api call for messages of the current conversation

    const { data : messagesData, 
      error :messagesError, 
      isLoading : isMessagesLoading, 
      isSuccess : isMessagesSuccess,
      isError : isMessagesError, 
      refetch : refetchMessages } = useGetAllMessagesForConversationQuery(

          { pageNum : ( messagesScrollType === 'upward') ? messagesPage : messagesPageMin,
            limitNum : 10, 
            conversationId : selectedConversationData.conversationId,
            initialFetch : isInitialFetchForMessages,
          },
          { skip : selectedConversationData?.isExistingConversation === false} ,
          {
              refetchOnMountOrArgChange: true, 
          }
    );
  

  useEffect(()=>{
    if(canSendMessageSuccess && canSendMessageData){
        setCanSendMessage( canSendMessageData?.success)
    }
  },[ canSendMessageSuccess, canSendMessageData])

  useEffect(()=>{
    
    setCanSendMessage(false);
    if(selectedConversationData?.userId){
      refetchCanSendMessage()
    }
  },[selectedConversationData.userId])


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    console.log("View Profile");
    handleMenuClose();
  };

  const handleBlockUnblockUser = () => {
    console.log(selectedConversationData?.isBlocked ? "Unblock User" : "Block User");
    handleMenuClose();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || messageInput.length > 500) {
      console.error('Failed to send message:', error);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Message Send Error');
      setErrorDialogMessage('Message cannot be empty or more than 500 letters.');
      return;
    }

    if (!canSendMessage) {
      console.log('Cannot send message at this time.');
      setErrorDialogOpen(true);
      setErrorDialogTitle('Message Send Error');
      setErrorDialogMessage('Cannot send message at this time.');
      return;
    }

    try {
      const response = await sendMessage({type:'text', text: messageInput, recipientId: selectedConversationData?.userId, isExistingConversation : selectedConversationData.isExistingConversation, conversationId : selectedConversationData?.conversationId }).unwrap();
      
      if (response.success) {

        if(!selectedConversationData.isExistingConversation){
          

          // Update selectedConversationData state immutably
          setSelectedConversationData(prevData => ({
            ...prevData,
            isExistingConversation: true,
            conversationId: response.conversationId,
          }));
          await setSelectedConversationsMessages((prevMessages) => [
            response.messageResponse,
            ...prevMessages,
          ]);

          //getting the user info from newConversations state

          const matchingConversation = newConversations.find(
            (conversation) =>
              conversation._id === response.messageResponse.receiver
          );

          const existingConversationToInsert ={
                _id : response.conversationId,
                unread_message_count : 0,
                last_message : {
                  sender : response.messageResponse.sender,
                  sent_at : response.messageResponse.sent_at,
                  text : response.messageResponse.text,
                },
                participant:[
                  {
                    isOnline : matchingConversation.isOnline,
                    image : matchingConversation.image || null,
                    name : matchingConversation.name || null,
                    _id: matchingConversation._id || null,
                },
                ],
          }

          

          //updates the existing conversation and newConversation
          setExistingConversations((prevConversations) =>[
            existingConversationToInsert, ...prevConversations
          ])

          setNewConversations((prevConversations) => {
          // Filter out the conversation to be removed
          const updatedNewConversations = prevConversations.filter(
            (conversation) =>
              conversation._id !== response.messageResponse.receiver
          );

          // Perform additional steps if needed

          return updatedNewConversations;
        });

        

          
        }else{
          setSelectedConversationsMessages((prevMessages) => [
            response.messageResponse,
            ...prevMessages,
          ]);
  
          // Update the existing conversations list
          setExistingConversations((prevConversations) => {
            // Find the updated conversation
            const updatedConversationIndex = prevConversations.findIndex(
              (conversation) => conversation._id === response.conversationId
            );
  
            if (updatedConversationIndex !== -1) {
              // Make a copy of the updated conversation
              const updatedConversation = {
                ...prevConversations[updatedConversationIndex],
                last_message: {
                  ...prevConversations[updatedConversationIndex].last_message,
                  text: response.messageResponse.text,
                  sent_at: response.messageResponse.sent_at,
                  sender: response.messageResponse.sender,
                },
              };
  
              // Remove the updated conversation from its current position
              const updatedConversations = prevConversations.filter(
                (conversation) => conversation._id !== response.conversationId
              );
  
              // Add the updated conversation to the beginning of the array
              updatedConversations.unshift(updatedConversation);
  
              return updatedConversations;
            }
  
            // If the conversation was not found (shouldn't happen), return the original array
            return prevConversations;
          });
        }


       

        setMessageInput(""); // Clear the input after sending
      }
      

    } catch (error) {
      console.error('Failed to send message:', error);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Message Send Error');
      setErrorDialogMessage(`An error occurred during sending message : ${error?.data?.message}`);
    }
  };

  const handleDeleteMessage = () => {
    // Implement your delete message logic here
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorDialogTitle('');
    setErrorDialogMessage('')
  };


//get all messages

  useEffect(()=>{

    if( selectedConversationData.isExistingConversation === true && selectedConversationData.conversationId !== null){
      
      if(messagesPage !== 1){
        setMessagesPage(1);
      }
 
    }
  },[selectedConversationData])



  // useEffect(() => {

  //   if (messagesData && isMessagesSuccess) {
  
      
  
  //     if (messagesPage === 1 ) {
        
  //       setSelectedConversationsMessages(messagesData?.messages || []);
  //       setMessagesPage((prevPage) => prevPage + 1);
  //       refetchMessages()

  //     } else {
        
  //       setSelectedConversationsMessagesTemp(messagesData?.messages || []);
  //     }
  //     setHasMoreMessages((messagesData?.messages || []).length > 0);
  //   }
    
  // }, [ messagesData, isMessagesSuccess]);
  
  
  useEffect(() => {

    if (messagesData && isMessagesSuccess) {

      console.log('recieved the messages from api',messagesData.messages)
  
      if(isInitialFetchForMessages){
        setIsInitialFetchForMessages(false);
        setMessagesPage(messagesData.currentPage)
        setMessagesPageMin(messagesData.currentPage)
        setSelectedConversationsMessages(messagesData?.messages || []);
        

      }else{

        setSelectedConversationsMessages(prevMessages => {
          const newMessages = messagesData?.messages.filter(newMessage => {
            const hasValidId = newMessage && newMessage._id;
            const isDuplicate = prevMessages.some(prevMessage => prevMessage._id === newMessage._id);
            return hasValidId && !isDuplicate;
          });
  
          if (messagesScrollType === 'upward') {
            return [...prevMessages, ...newMessages];
          } else {
            return [...newMessages, ...prevMessages];
          }
        });

      }

      setHasMoreUnreadMessages(messagesData?.unreadCount > 10);
      setHasMoreMessages(messagesData?.totalPages > messagesPage);

    }
    
  }, [ messagesData, isMessagesSuccess]);


  
  useEffect(()=>{
    if (messagesError) {
      console.error('Error fetching ExistingConversations:', messagesError);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Messages Listing Error');
      setErrorDialogMessage(`An error occurred during listing messages : ${messagesError?.data?.message}`);
      
    }
  }, [isMessagesError])
  
  const fetchMoreMessages = () =>{

      if(!isMessagesLoading){
        setMessagesScrollType('upward')
        setMessagesPage(prevPage => prevPage + 1);
        
      }   
  }

  const fetchMoreUnreadMessages = () =>{

    if(!isMessagesLoading && messagesPageMin > 1){
      setMessagesScrollType('downward')
      setMessagesPageMin(prevPage => prevPage - 1);
      
    }   
}


const handleScroll = () => {
  const scrollElement = document.getElementById('scrollableCard');
  if (scrollElement.scrollTop === 0 && hasMoreMessages) {
    fetchMoreMessages();
  } else if (scrollElement.scrollHeight - scrollElement.scrollTop === scrollElement.clientHeight && hasMoreUnreadMessages) {
    fetchMoreUnreadMessages();
  }
};

useEffect(() => {
  const scrollElement = document.getElementById('scrollableCard');
  scrollElement.addEventListener('scroll', handleScroll);
  return () => {
    scrollElement.removeEventListener('scroll', handleScroll);
  };
}, [hasMoreMessages, hasMoreUnreadMessages]);

  return (
    <GlassmorphicChatboxCard>
      <GlassmorphicAppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => handleConversationClick(null)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar
            src={selectedConversationData?.userImage}
            alt={selectedConversationData?.userName}
            sx={{ marginRight: 2 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {selectedConversationData?.userName}
            <CircleIcon
              sx={{
                color: selectedConversationData?.isOnline ? "green" : "gray",
                fontSize: "0.8rem",
                marginLeft: 1,
              }}
            />
          </Typography>

          {/* <IconButton edge="end" color="inherit" aria-label="more" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
            <MenuItem onClick={handleBlockUnblockUser}>
              {selectedConversationData?.isBlocked ? "Unblock User" : "Block User"}
            </MenuItem>
          </Menu> */}
        </Toolbar>
      </GlassmorphicAppBar>
      <CardContent sx={{ flexGrow: 1, overflowY: "auto", ...scrollBarStyles }} id="scrollableCard">
        

                          { (selectedConversationData.isExistingConversation) ?  (
                            
                            <InfiniteScroll
                            dataLength={selectedConversationsMessages.length}
                            next={fetchMoreMessages}
                            hasMore={hasMoreMessages || hasMoreUnreadMessages}
                            loader={<GradientCircularProgress />}
                            scrollableTarget="scrollableCard"
                            style={{ display: 'flex', flexDirection: 'column-reverse' }}
                            refreshFunction={fetchMoreUnreadMessages}
                            pullDownToRefresh
                            pullDownToRefreshThreshold={50}
                            pullDownToRefreshContent={
                              <h3 style={{ textAlign: 'center' }}>&#8595;</h3>
                            }
                            releaseToRefreshContent={
                              <h3 style={{ textAlign: 'center' }}>&#8593;</h3>
                            }
                            
                            
                          >

                                {selectedConversationsMessages.map((message, index) => (
                                  <Box key={`${message._id}_${index}`}>
                                    {message.sent_by_you === true ? (
                                      <SentMessage
                                        content={message?.text}
                                        time={message?.sent_at}
                                        isRead={message?.is_read}
                                        onDelete={handleDeleteMessage}
                                      />
                                    ) : (
                                      <ReceivedMessage
                                        content={message?.text}
                                        time={message?.sent_at}
                                      />
                                    )}
                                  </Box>
                                ))}

                              

                          </InfiniteScroll>
                          
                          ) : (
                            <>
                            <h1>Hii</h1>
                            </>
                          )}

        {/* <Box>
          <ReceivedMessage content="Hello!" time="10:30 AM" />
          <ReceivedMessage
            content="How are you? How are you? How are you? How are you?How are you? How are you?How are you?How are you?How are you?How are you?How are you?"
            time="10:31 AM"
          />

          <SentMessage
            content="I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!"
            time="10:32 AM"
            isRead={true}
            onDelete={handleDeleteMessage}
          />
          <SentMessage
            content="I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!"
            time="10:32 AM"
            isRead={true}
            onDelete={handleDeleteMessage}
          />
          <SentMessage
            content="I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!"
            time="10:32 AM"
            isRead={true}
            onDelete={handleDeleteMessage}
          />
          <SentMessage
            content="I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!I'm good, thanks!"
            time="10:32 AM"
            isRead={false}
            onDelete={handleDeleteMessage}
          />

          <TypingIndicator />
        </Box> */}
      </CardContent>

      <MessageInput
        onSendMessage={handleSendMessage}
        canSendMessage={canSendMessage}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
      />

      {!!errorDialogOpen && (
        <ErrorAlertDialog
          open={errorDialogOpen}
          handleClose={handleCloseErrorDialog}
          title={errorDialogTitle}
          message={errorDialogMessage}
        />
      )}
    </GlassmorphicChatboxCard>
  );
};

export default ChatBoxConversation;
