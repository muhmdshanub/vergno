import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, InputAdornment, ClickAwayListener, FormHelperText } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';
import Picker from 'emoji-picker-react';
import { styled } from '@mui/material/styles';

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

const MessageInput = ({ onSendMessage, canSendMessage, messageInput, setMessageInput }) => {
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      if (messageInput.length + emojiObject.emoji.length <= 500) {
        setMessageInput((prevMessage) => prevMessage + emojiObject.emoji);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= 500) {
      setMessageInput(e.target.value);
    }
  };

  const handleEmojiButtonClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{
        position: 'relative',
        padding: 2,
        width: '100%',
        margin: 'auto',
        display: 'flex',
        alignItems: 'center'
      }}>
        <TextField
          placeholder="Type a message..."
          variant="outlined"
          multiline
          minRows={1}
          maxRows={3}
          value={messageInput}
          onChange={handleInputChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleEmojiButtonClick} sx={{marginBottom:'8px'}}>
                  <EmojiEmotionsIcon />
                </IconButton>
                <FormHelperText sx={{ position:'absolute', right:'50px', bottom:'0px' }}>
                  {messageInput.length} / 500
                </FormHelperText>
              </InputAdornment>
            ),
            sx: {
              borderRadius: '15px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(8px) saturate(200%)',
              WebkitBackdropFilter: 'blur(8px) saturate(200%)',
              ...scrollBarStyles
            },
          }}
          sx={{ width: 'calc(100% - 50px)', ...scrollBarStyles }}
        />
        
        {showEmojiPicker && (
          <Box
            ref={emojiPickerRef}
            sx={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)', // Position above the input field
              right: '2rem', // Position to the right side of the screen
              zIndex: 1000,
            }}
          >
            <Picker onEmojiClick={handleEmojiClick} />
          </Box>
        )}
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || !canSendMessage}
          sx={{ marginLeft: '5px' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </ClickAwayListener>
  );
};

export default MessageInput;
