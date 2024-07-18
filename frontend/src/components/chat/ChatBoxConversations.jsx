import React,{useState, useEffect, useRef} from 'react';
import { Box, Card, CardContent, TextField, Typography, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CircleIcon from '@mui/icons-material/Circle';
import MessageInput from './MessageInput';
import TypingIndicator from './MessageTypingIndicator';
import SentMessage from './SentMessage';
import ReceivedMessage from './ReceivedMessage';
import { useCheckCanSendMessageQuery, useSendMessageMutation , useLazyGetAllMessagesForConversationQuery, useMarkAsReadMessageMutation } from '../../slices/api_slices/messagesApiSlice';
import ErrorAlertDialog from '../ErrorAlertDialoge';
import GradientCircularProgress from '../GradientCircularProgress';
import InfiniteScroll from 'react-infinite-scroll-component';
import relativeTime from '../../utils/relativeTime';
import { useInView } from 'react-intersection-observer';
import { decrementUnreadMessageCount } from '../../slices/messageCountSlice';
import { useDispatch } from 'react-redux';

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


// MessageComponent.jsx
const MessageComponent = ({ message, handleMessageInView }) => {
  const [messageRef, inViewMessage] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inViewMessage && message.sent_by_you === false && message.is_read === false) {
      handleMessageInView(message);
    }
  }, [inViewMessage, message]);

  return (
    <div ref={messageRef}>
      {message.sent_by_you ? (
        <SentMessage
          content={message.text}
          time={message.sent_at}
          isRead={message.is_read}
          onDelete={() => handleDeleteMessage(message._id)}
        />
      ) : (
        <ReceivedMessage
          content={message.text}
          time={message.sent_at}
        />
      )}
    </div>
  );
};

const ChatBoxConversation = ({
  handleConversationClick,
  selectedConversationData, 
  setSelectedConversationData,
  messageInput, 
  setMessageInput, 
  selectedConversationsMessages, 
  setSelectedConversationsMessages, 
  setExistingConversations,
  setNewConversations,
  newConversations,
  isInitialFetchForMessages,
  setIsInitialFetchForMessages,

  }) => {
  
  const dispatch = useDispatch();


  const [canSendMessage, setCanSendMessage] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1)
  const [messagesPageMin, setMessagesPageMin] = useState(1)
  const [messagesScrollType, setMessagesScrollType] = useState('upward')
  const [hasMoreTop, setHasMoreTop] = useState(true);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);



  const [topRef, inViewTop] = useInView();
  const [bottomRef, inViewBottom] = useInView();

  
  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const { data : canSendMessageData, isSuccess : canSendMessageSuccess, refetch : refetchCanSendMessage } = useCheckCanSendMessageQuery({recipientId : selectedConversationData?.userId}, { skip: selectedConversationData === null });

  const [sendMessage, { isLoading: isSending, isSuccess: sendSuccess, data: sendMessageData }] = useSendMessageMutation();

  const[markAsReadMessage] = useMarkAsReadMessageMutation();
 
    // get api call for messages of the current conversation

    const [fetchAllMessages,{ data : messagesData, 
      error :messagesError, 
      isLoading : isMessagesLoading, 
      isSuccess : isMessagesSuccess,
      isError : isMessagesError }] = useLazyGetAllMessagesForConversationQuery();
  

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
      
      
        setMessagesPage(1);
        setMessagesPageMin(1);
        setHasMoreBottom(true)
        setHasMoreTop(true)
        setMessagesScrollType('upward');
        setIsInitialFetchForMessages(true);

        fetchAllMessages({pageNum : 1, limitNum : 10, conversationId : selectedConversationData.conversationId, initialFetch : true, })


 
    }
  },[selectedConversationData])



  useEffect(() => {
    if (inViewTop && hasMoreTop) {
      fetchMoreMessages('upward');
    }
  }, [inViewTop, hasMoreTop]);

  useEffect(() => {
    if (inViewBottom && hasMoreBottom) {
      fetchMoreMessages('downward');
    }
  }, [inViewBottom, hasMoreBottom]);


  useEffect(() => {
    if (messagesData && isMessagesSuccess) {
      

      if (isInitialFetchForMessages) {
        setIsInitialFetchForMessages(false);
        setMessagesPage(messagesData.currentPage);
        setMessagesPageMin(messagesData.currentPage);
        setSelectedConversationsMessages(messagesData?.messages || []);
      } else {
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

      setHasMoreBottom(messagesData?.unreadCount > 10);
      setHasMoreTop(messagesData?.totalPages > messagesPage);
    }
  }, [messagesData, isMessagesSuccess]);
  
  useEffect(()=>{
    if (messagesError) {
      console.error('Error fetching ExistingConversations:', messagesError);
      setErrorDialogOpen(true);
      setErrorDialogTitle('Messages Listing Error');
      setErrorDialogMessage(`An error occurred during listing messages : ${messagesError?.data?.message}`);
      
    }
  }, [isMessagesError])
  



const fetchMoreMessages = async (direction) => {

  

  if (!isMessagesLoading) {

    

    if (direction === 'upward') {
       setMessagesScrollType('upward');
       setMessagesPage(prevPage => prevPage + 1);
      await fetchAllMessages({pageNum : messagesPage, limitNum: 10,  conversationId : selectedConversationData.conversationId, initialFetch : false, });
      

    } else if (direction === 'downward') {
      
      if(messagesPageMin > 1){
         setMessagesScrollType('downward');
         setMessagesPageMin(prevPage => prevPage - 1);
         const response = await fetchAllMessages({pageNum : messagesPageMin, limitNum: 10,  conversationId : selectedConversationData.conversationId, initialFetch : false, });
        
        }
      
      
      
    }

     
  }
};



const handleMessageInView = async (message) => {
  
  console.log("viewed message is ", message)

  try {
    const response = await markAsReadMessage({ messageId: message._id });

    
    if (response.data.success) {

      dispatch(decrementUnreadMessageCount())

      // Update state
      setSelectedConversationsMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === message._id ? { ...msg, is_read: response.data.messageResponse.is_read, read_at: response.data.messageResponse.read_at } : msg
        )
      );

       // Update conversations state
      // Update conversations state
      setExistingConversations((prevConversations) => {
        
        const updatedConversationIndex = prevConversations.findIndex(
          (conversation) => conversation._id === response.data.messageResponse.conversation_id
        );

        if (updatedConversationIndex !== -1) {

          console.log("found a matching conversation")

          // Find the conversation to update
          const conversationToUpdate = prevConversations[updatedConversationIndex];

          // Update the unread_message_count field
          const updatedConversation = {
            ...conversationToUpdate,
            unread_message_count: Math.max(conversationToUpdate.unread_message_count - 1, 0),
          };

          // Create a new array with the updated conversation
          const updatedConversations = [...prevConversations];
          updatedConversations[updatedConversationIndex] = updatedConversation;

          return updatedConversations;
        }

        
        return prevConversations;
      });

    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

useEffect(() => {
  // Ensure handleMessageInView is defined and properly handled
  if (!handleMessageInView) {
    throw new Error('handleMessageInView is required in props');
  }
}, [handleMessageInView]);


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

        </Toolbar>
      </GlassmorphicAppBar>
      <CardContent sx={{ flexGrow: 1, overflowY: "auto", ...scrollBarStyles }} id="scrollableCard">
        

                          { (selectedConversationData.isExistingConversation) ?  (

                          <Box
                              sx={{
                                height: '400px',
                                overflow: 'auto',
                                display: 'flex',
                                flexDirection: 'column-reverse'
                              }}
                            >
                              <div ref={bottomRef}>
                                <Typography>{(hasMoreBottom && messagesPageMin > 1) ? "Loading more new messages..." : ""}</Typography>
                              </div>

                              
                              {/* {selectedConversationsMessages.map((message) => (
                                <Box key={message._id} sx={{ padding: '8px',  }}>
                                  {message.sent_by_you ? (
                                    <SentMessage
                                      content={message?.text}
                                      time={message?.sent_at}
                                      isRead={message?.is_read}
                                      onDelete={() => handleDeleteMessage(message._id)}
                                    />
                                  ) : (
                                    <ReceivedMessage
                                      content={message?.text}
                                      time={message?.sent_at}
                                    />
                                  )}
                                </Box>
                              ))} */}

{/* {selectedConversationsMessages.map((message, index) => {
  const [messageRef, inViewMessage] = useInView({
    triggerOnce: true,
    threshold: 0.1, // Adjust this threshold as needed
  });

  useEffect(() => {
    if (inViewMessage) {
      handleMessageInView(message);
    }
  }, [inViewMessage, handleMessageInView, message]);

  return (
    <div key={index}>
      <div ref={messageRef}>
        {message.sent_by_you ? (
          <SentMessage
            content={message?.text}
            time={message?.sent_at}
            isRead={message?.is_read}
            onDelete={() => handleDeleteMessage(message._id)}
          />
        ) : (
          <ReceivedMessage
            content={message?.text}
            time={message?.sent_at}
          />
        )}
      </div>
    </div>
  );
})} */}
                              
                              {selectedConversationsMessages.map((message, index) => {
                                // Conditionally move logic into a separate component if needed
                                return <MessageComponent key={index} message={message}  handleMessageInView={ handleMessageInView} />;
                              })}

                              <div ref={topRef}>
                                <Typography>{hasMoreTop ? "Loading more older messages..." : ""}</Typography>
                              </div>
                            </Box>
                          
                          ) : (
                            <>
                            
                            </>
                          )}

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
