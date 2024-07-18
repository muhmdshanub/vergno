import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';

const mockMessages = Array.from({ length: 105 }, (_, i) => ({
  id: i,
  content: `Message ${i + 1}`,
}));

const InfiniteScrollComponent = () => {
  // Start from the middle of the mock data
  const initialStartIndex = 100;
  const initialEndIndex = 105;

  const [messages, setMessages] = useState(mockMessages.slice(initialStartIndex, initialEndIndex));
  const [hasMoreTop, setHasMoreTop] = useState(true);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);

  const [topRef, inViewTop] = useInView();
  const [bottomRef, inViewBottom] = useInView();

  useEffect(() => {
    if (inViewTop && hasMoreTop) {
      fetchMoreMessages('top');
    }
  }, [inViewTop, hasMoreTop]);

  useEffect(() => {
    if (inViewBottom && hasMoreBottom) {
      fetchMoreMessages('bottom');
    }
  }, [inViewBottom, hasMoreBottom]);

  const fetchMoreMessages = (direction) => {
    if (direction === 'top') {
      const startIndex = messages[0].id - 10;
      if (startIndex < 0) {
        setHasMoreTop(false);
        return;
      }
      const olderMessages = mockMessages.slice(startIndex, messages[0].id);
      setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
    } else if (direction === 'bottom') {
      const endIndex = messages[messages.length - 1].id + 10;
      if (endIndex >= mockMessages.length) {
        setHasMoreBottom(false);
        return;
      }
      const newerMessages = mockMessages.slice(messages[messages.length - 1].id + 1, endIndex + 1);
      setMessages((prevMessages) => [...prevMessages, ...newerMessages]);
    }
  };

  return (
    <Box
      sx={{
        height: '400px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
    >
      <div ref={topRef}>
        <Typography>Loading more...</Typography>
      </div>
      
      {messages.map((message) => (
        <Box key={message.id} sx={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
          {message.content}
        </Box>
      ))}
      
      <div ref={bottomRef}>
        <Typography>Loading more...</Typography>
      </div>
    </Box>
  );
};

export default InfiniteScrollComponent;
