import React, { useState , useEffect, useRef} from 'react';
import { Grid, Box, Typography, TextField, Card, CardContent, List, ListItem, ListItemText, Divider, IconButton, InputBase, Hidden } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ErrorAlertDialog from '../components/ErrorAlertDialoge';
import SingleInboxCard from '../components/chat/SingleInboxCard';
import SingleNewChatCard from '../components/chat/SingleNewChatCard';
import ChatLanding from '../components/chat/ChatLanding';
import ChatBoxConversation from '../components/chat/ChatBoxConversations';
import { useGetAllExistingConversationsQuery, useGetAllNewConversationsQuery } from '../slices/api_slices/messagesApiSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import InboxConversationCardSkeleton from '../components/skeletons/InboxConversationCardSkeleton';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

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


const GlassmorphicInboxCard = styled(Card)(({ theme }) => ({
  height: '80vh',
  padding:'0',
  margin:'0px',
  overflowY: 'auto',
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
  ...scrollBarStyles,

}));

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

const GlassmorphicSearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 2,
  padding: '0 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(255, 255, 255, .15)', // Semi-transparent background
  backdropFilter: 'blur(6px) saturate(200%)',
  WebkitBackdropFilter: 'blur(6px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.2)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.3)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
}));

const GlassmorphicListBox = styled(Box)(({ theme }) => ({
  marginTop: '1rem', 
  minHeight:'250px',
  padding:'5px',
  backgroundColor: 'rgba(255, 255, 255, 0.001)', // Semi-transparent background
  backdropFilter: 'blur(4px) saturate(200%)',
  WebkitBackdropFilter: 'blur(4px) saturate(200%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.1)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.005)', // Slightly more opaque background
    border: '1px solid rgba(209, 213, 219, 0.2)', // Slightly more opaque border
    boxShadow: theme.shadows[6], // Increase box shadow on hover
  },
}));


const ChatScreen = () => {

  const {userInfo} = useSelector((state) => state.userAuth)

  const [messageInput, setMessageInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedConversationsMessages, setSelectedConversationsMessages] = useState([])
  const [selectedConversationsMessagesTemp, setSelectedConversationsMessagesTemp] = useState([])
  const limit = 20;
  const [errorFlag, setErrorFlag] = useState(false);

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  //states for existing Conversations
  const [existingConversations, setExistingConversations] = useState([]);
  const [tempExistingConversations, setTempExistingConversations] = useState([]);
  const [existingConversationsPage, setExistingConversationsPage] = useState(1);
  const [hasMoreExistingConversations, setHasMoreExistingConversations] = useState(true);

  //states for new conversations
  const [newConversations, setNewConversations] = useState([]);
  const [tempNewConversations, setTempNewConversations] = useState([]);
  const [newConversationsPage, setNewConversationsPage] = useState(1);
  const [hasMoreNewConversations, setHasMoreNewConversations] = useState(true);


  const [openSocket, setOpenSocket] = useState("true")



  //socket listener for real time chat
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_HOST_IP); // Replace with your socket URL
  
    socketRef.current.emit('joinRoom', userInfo._id);
  
    // Listener for incoming messages
    socketRef.current.on('new_message', (message) => {

      console.log('message recieved', message)

      //updating the opened conversation if its an existing conversation or new conversation
  
      if(selectedConversation !== null ){

        if ( selectedConversation?.isExistingConversation &&  message.messageResponse.conversation_id === selectedConversation?.conversationId || message.messageResponse.sender === selectedConversation.userId) {
          setSelectedConversationsMessages((prevMessages) => [message.messageResponse, ...prevMessages]);
        }
  
        if (!selectedConversation?.isExistingConversation && message.messageResponse.sender === selectedConversation.userId) {
          
          setSelectedConversation(prevData => ({
            ...prevData,
            isExistingConversation: true,
            conversationId: message.messageResponse.conversation_id,
          }));
          
          setSelectedConversationsMessages((prevMessages) => [message.messageResponse, ...prevMessages]);
        }

      }


      //logic for updating inbox cards

      const matchFoundInExistingConversations =  existingConversations.some(
        (conversation) =>
          conversation._id === message.messageResponse.conversation_id
      );

      if(!matchFoundInExistingConversations){
        console.log("not found a match")
      }
      if(matchFoundInExistingConversations){

        console.log('match found in existing conversation', message)

        setExistingConversations((prevConversations) => {
          // Find the updated conversation
          const updatedConversationIndex = prevConversations.findIndex(
            (conversation) => conversation._id === message.messageResponse.conversation_id
          );

          if (updatedConversationIndex !== -1) {
            // Make a copy of the updated conversation
            const updatedConversation = {
              ...prevConversations[updatedConversationIndex],
              last_message: {
                text: message.messageResponse.text,
                sent_at: message.messageResponse.sent_at,
                sender: message.messageResponse.sender,
              },
              unread_message_count:
                (prevConversations[updatedConversationIndex].unread_message_count || 0) +
                1,
            };

            // Remove the updated conversation from its current position
            const updatedConversations = prevConversations.filter(
              (conversation) => conversation._id !== message.messageResponse.conversation_id
            );

            // Add the updated conversation to the beginning of the array
            updatedConversations.unshift(updatedConversation);

            return updatedConversations;
          }

          // If the conversation was not found (shouldn't happen), return the original array
          return prevConversations;
        });

        return;
      }


      // const matchFoundInExistingConversationsTemp = tempExistingConversations.some(
      //   (conversation) =>
      //     conversation._id === message.messageResponse.conversation_id
      // );
      
      // if (matchFoundInExistingConversationsTemp) {
      //   let updatedConversation = {};
      
      //   setTempExistingConversations((prevConversations) => {
      //     // Find the updated conversation
      //     const updatedConversationIndex = prevConversations.findIndex(
      //       (conversation) => conversation._id === message.messageResponse.conversation_id
      //     );
      
      //     if (updatedConversationIndex !== -1) {
      //       // Make a copy of the updated conversation
      //       updatedConversation = {
      //         ...prevConversations[updatedConversationIndex],
      //         last_message: {
      //           text: message.messageResponse.text,
      //           sent_at: message.messageResponse.sent_at,
      //           sender: message.messageResponse.sender,
      //         },
      //         unreadCount:
      //           (prevConversations[updatedConversationIndex].unreadCount || 0) + 1,
      //       };
      
      //       // Remove the updated conversation from its current position
      //       const updatedConversations = prevConversations.filter(
      //         (conversation) => conversation._id !== message.messageResponse.conversation_id
      //       );
      
      //       // Move the setExistingConversations call inside the callback
      //       setExistingConversations((prevExistingConversations) => [
      //         updatedConversation,
      //         ...prevExistingConversations,
      //       ]);
      
      //       return updatedConversations;
      //     }
      //     // If the conversation was not found (shouldn't happen), return the original array
      //     return prevConversations;
      //   });
      
      //   return;
      // }


      // const matchingConversationFromNewConversation = newConversations.find(
      //   (conversation) => conversation._id === message.messageResponse.receiver
      // );
    
      // if (matchingConversationFromNewConversation) {
      //   const existingConversationToInsert = {
      //     _id: message.messageResponse.conversation_id,
      //     unread_message_count: 1,
      //     last_message: {
      //       sender: message.messageResponse.sender,
      //       sent_at: message.messageResponse.sent_at,
      //       text: message.messageResponse.text,
      //     },
      //     participants: [
      //       {
      //         isOnline: matchingConversationFromNewConversation.isOnline,
      //         image: matchingConversationFromNewConversation.image || null,
      //         name: matchingConversationFromNewConversation.name || null,
      //         _id: matchingConversationFromNewConversation._id || null,
      //       },
      //     ],
      //   };
    
      //   // Update existing conversations
      //   setExistingConversations((prevConversations) => [
      //     existingConversationToInsert,
      //     ...prevConversations,
      //   ]);
    
      //   // Update new conversations
      //   setNewConversations((prevConversations) => {
      //     // Filter out the conversation to be removed
      //     return prevConversations.filter(
      //       (conversation) =>
      //         conversation._id !== message.messageResponse.receiver
      //     );
      //   });

      //   return;
      // }

      // const matchingConversationFromTempNewConversation = tempNewConversations.find(
      //   (conversation) => conversation._id === message.messageResponse.receiver
      // );

      // if (matchingConversationFromTempNewConversation) {
      //   const existingConversationToInsert = {
      //     _id: message.messageResponse.conversation_id,
      //     unread_message_count: 1,
      //     last_message: {
      //       sender: message.messageResponse.sender,
      //       sent_at: message.messageResponse.sent_at,
      //       text: message.messageResponse.text,
      //     },
      //     participants: [
      //       {
      //         isOnline: matchingConversationFromTempNewConversation.isOnline,
      //         image: matchingConversationFromTempNewConversation.image || null,
      //         name: matchingConversationFromTempNewConversation.name || null,
      //         _id: matchingConversationFromTempNewConversation._id || null,
      //       },
      //     ],
      //   };
    
      //   // Update existing conversations
      //   setExistingConversations((prevConversations) => [
      //     existingConversationToInsert,
      //     ...prevConversations,
      //   ]);
    
      //   // Update new conversations
      //   setTempNewConversations((prevConversations) => {
      //     // Filter out the conversation to be removed
      //     return prevConversations.filter(
      //       (conversation) =>
      //         conversation._id !== message.messageResponse.receiver
      //     );
      //   });

      //   return;
      // }

      // if(!matchFoundInExistingConversations && !matchFoundInExistingConversationsTemp && !matchingConversationFromNewConversation && !matchingConversationFromTempNewConversation){
      //   setTempExistingConversations([]);
      //   setTempNewConversations([]);
      //   setExistingConversationsPage(1);
      //   setNewConversationsPage(1);
      // }
        
      

      
    });
  
    return () => {
      // Clean up socket connection on unmount
      socketRef.current.disconnect();
    };
  }, [selectedConversation],[openSocket]);
  




  // get api call for existing conversations

  const { data : existingConversationsData, error : existingConversationsError, isLoading : isExistingConversationsLoading, isSuccess : isExistingConversationsSuccess,isError : isExistingConversationsError, refetch : refetchExistingConversations } = useGetAllExistingConversationsQuery(
    { pageNum : existingConversationsPage, limitNum : '10', searchBy : searchInput.trim() },
    {refetchOnMountOrArgChange: true, }
  );

   // get api call for new conversations

   const { data : newConversationsData, error : newConversationsError, isLoading : isNewConversationsLoading, isSuccess : isNewConversationsSuccess,isError : isNewConversationsError, refetch : refetchNewConversations } = useGetAllNewConversationsQuery(
    { pageNum : newConversationsPage, limitNum : '10', searchBy : searchInput.trim() },
    {refetchOnMountOrArgChange: true, }
  );


  // for existing conversations

  useEffect(() => {

  if (existingConversationsData && isExistingConversationsSuccess) {

    
   

    if (existingConversationsPage === 1 ) {
      
      setExistingConversations(existingConversationsData?.conversations || []);
      setExistingConversationsPage((prevPage) => prevPage + 1);
      refetchExistingConversations();
    } else {
      setTempExistingConversations(existingConversationsData?.conversations || []);
    }
    setHasMoreExistingConversations((existingConversationsData?.conversations || []).length > 0);
  }
  
}, [ existingConversationsData, isExistingConversationsSuccess]);



useEffect(()=>{
  if (existingConversationsError) {
    console.error('Error fetching ExistingConversations:', existingConversationsError);
    setErrorFlag(JSON.stringify(existingConversationsError?.data?.message || existingConversationsError?.message) || 'Error fetching existingConversations');
  }
}, [isExistingConversationsError])


useEffect(()=>{
  setExistingConversations([]);
  setExistingConversationsPage(1);
  refetchExistingConversations();
},[searchInput])



const fetchMoreExistingConversations = () =>{
   
    setExistingConversations(prevConversations => [...prevConversations, ...tempExistingConversations]);
    if(!isExistingConversationsLoading){
      setExistingConversationsPage(prevPage => prevPage + 1);
      refetchExistingConversations();
    }
    
}

//for new chats


useEffect(() => {
  if (newConversationsData && isNewConversationsSuccess ) {
    
    if (newConversationsPage === 1) {
      
      setNewConversations(newConversationsData?.users || []);
      setNewConversationsPage((prevPage) => prevPage + 1);
      refetchNewConversations();
    } else {
      setTempNewConversations(newConversationsData?.users || []);
    }
    setHasMoreNewConversations((newConversationsData?.users || []).length > 0);
  }
  
}, [ newConversationsData, isNewConversationsSuccess, searchInput]);



useEffect(()=>{
  if (newConversationsError) {
    console.error('Error fetching NewConversations:', newConversationsError);
    setErrorFlag(JSON.stringify(newConversationsError?.data?.message || newConversationsError?.message) || 'Error fetching existingConversations');
  }
}, [isNewConversationsError])


useEffect(()=>{
  
  setNewConversations([]);
  setNewConversationsPage(1);
  refetchNewConversations();
},[searchInput])



const fetchMoreNewConversations = () =>{
   
    setNewConversations(prevConversations => [...prevConversations, ...tempNewConversations]);
    if(!isNewConversationsLoading){
      setNewConversationsPage(prevPage => prevPage + 1);
      refetchNewConversations();
    }
    
}






//

  const handleSearchInputChnage = (e) =>{
    setSearchInput(e.target.value)
  }


  const handleInboxPageChange = (event, value) => {
    setInboxPage(value);
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  const handleConversationClick = (conversation) => {
    setMessageInput('')
    setSelectedConversationsMessages([]);
    setSelectedConversationsMessagesTemp([]);
    setSelectedConversation(conversation);

    
    
  };

  






  return (
    <Box sx={{ flexGrow: 1, padding: 2, color: '#ffffff' }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={12} lg={10}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", }}>
            <Typography variant="h5" component="div" sx={{ margin: "20px 10px" }}>Chat</Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Inbox Grid */}
            <Hidden smDown={selectedConversation !== null}>
                <Grid item xs={12} sm={5} md={4} >
                  <GlassmorphicInboxCard sx={{ margin:'0px',width:'100%', minWidth:'fit-content'}} id="scrollableInboxCard">
                    <CardContent>
                      <GlassmorphicSearchBox >
                        <IconButton sx={{ padding: '10px' }}>
                          <SearchIcon />
                        </IconButton>
                        <InputBase
                          fullWidth
                          onChange={(e) => handleSearchInputChnage(e)}
                          value={searchInput}
                          placeholder="Search chat..."
                          inputProps={{ 'aria-label': 'search chat' }}
                          sx={{ color: 'inherit', '& .MuiInputBase-input': { padding: '10px 0', border: 'none', outline: 'none' } }}
                        />
                      </GlassmorphicSearchBox>
                      

                      {/* Box for listing new*/}
                        <GlassmorphicListBox>
                          <Typography variant="h6" sx={{ marginBottom: 1, }}>Inbox</Typography>
                        

                                  <InfiniteScroll
                                              dataLength={existingConversations.length}
                                              next={fetchMoreExistingConversations}
                                              hasMore={hasMoreExistingConversations}
                                              loader={<Typography>Loading existing conversations</Typography>}
                                              scrollableTarget="scrollableInboxCard"
                                              >
                                              


                                                {isExistingConversationsLoading ? (
                                                                          Array.from(new Array(5)).map((_, index) => (
                                                                            <InboxConversationCardSkeleton key={`existing_inbox_${index}`} />
                                                                          ))
                                                                        ) : (
                                                                          existingConversations.map(conversation => (
                                                                            <SingleInboxCard
                                                                              key={`existing_conversation_${conversation._id}`}
                                                                              userImage={conversation?.participant[0]?.image?.url || conversation?.participant[0]?.googleProfilePicture}
                                                                              userName={conversation?.participant[0]?.name}
                                                                              userId={conversation?.participant[0]?._id}
                                                                              isOnline={conversation?.participant[0]?.isOnline}
                                                                              lastMessage={conversation?.last_message?.text}
                                                                              messageTime={conversation?.last_message?.sent_at}
                                                                              isLastMessageFromCurrentUser={conversation?.last_message?.sender !== conversation?.participant[0]?._id}
                                                                              conversationId={conversation?._id}
                                                                              handleConversationClick={handleConversationClick}
                                                                              unreadMessages={conversation?.unread_message_count}
                                                                            />
                                                                          ))
                                                      )}

{
                                                (isExistingConversationsSuccess && existingConversations.length === 0) &&(
                                                  <Box sx={{padding:'auto'}}>
                                                     <Typography variant='body1'> No Chats. </Typography>
                                                  </Box>
                                                )
                                               }


                                              </InfiniteScroll>



                        </GlassmorphicListBox>

                        {/* Box for listing other users */}
                        <GlassmorphicListBox>
                          <Typography variant="h6" sx={{ marginBottom: 1,}}>Start New Chat</Typography>
                          
                          


                                      <InfiniteScroll
                                              dataLength={newConversations.length}
                                              next={fetchMoreNewConversations}
                                              hasMore={hasMoreNewConversations}
                                              loader={<Typography>Loading new Chats</Typography>}
                                              scrollableTarget="scrollableInboxCard"
                                              >
                                              

                                                {isNewConversationsLoading ? (
                                                                          Array.from(new Array(5)).map((_, index) => (
                                                                            <InboxConversationCardSkeleton key={`new_inbox_${index}`} />
                                                                          ))
                                                                        ) : (
                                                                          newConversations.map((conversation , index) => (
                                                                            <SingleNewChatCard
                                                                              key={`new_inbox_{conversation?._id}_${index}`}
                                                                              userImage={conversation?.image?.url || conversation?.googleProfilePicture}
                                                                              userName={conversation?.name}
                                                                              isOnline={conversation?.isOnline}
                                                                              userId={conversation?._id}
                                                                              handleConversationClick={handleConversationClick}
                                                                            />
                                                                          ))
                                                                        )}
                                               {
                                                (isNewConversationsSuccess && newConversations.length === 0) &&(
                                                  <Box sx={{padding:'auto'}}>
                                                     <Typography variant='body1'> No suggestions </Typography>
                                                  </Box>
                                                )
                                               }
                                      </InfiniteScroll>
                        </GlassmorphicListBox>


                    </CardContent>
                  </GlassmorphicInboxCard>
                </Grid>
            </Hidden>
            

            {/* Messages Grid */}
            <Grid item xs={12} sm={7} md={8} >

            {selectedConversation !== null ? (

                <ChatBoxConversation handleConversationClick={handleConversationClick}  selectedConversationData={selectedConversation} messageInput={messageInput} setMessageInput={setMessageInput} selectedConversationsMessages={selectedConversationsMessages} setSelectedConversationsMessages={setSelectedConversationsMessages} selectedConversationsMessagesTemp={selectedConversationsMessagesTemp} setSelectedConversationsMessagesTemp={setSelectedConversationsMessagesTemp} setExistingConversations={setExistingConversations} setNewConversations={setNewConversations}  newConversations={newConversations} setSelectedConversationData={setSelectedConversation}  />

              ) : (
                <Hidden smDown>
                  <ChatLanding />
                </Hidden>
              )}


            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {(!!errorDialogOpen) && (
        <ErrorAlertDialog
          open={errorDialogOpen}
          handleClose={handleCloseErrorDialog}
          title={errorDialogTitle}
          message={errorDialogMessage}
        />
      )}
    </Box>
  );
};

export default ChatScreen;
