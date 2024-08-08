


import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import SwitchHeaders from "./components/HOC/SwitchHeaders";
import UserSocketProvider from "./components/HOC/socket_io/UserSocketProvider";
import { keyframes } from '@emotion/react';
import { useSelector } from 'react-redux';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%, 100% 50%, 50% 50%;
  }
  50% {
    background-position: 100% 50%, 0% 50%, 50% 50%;
  }
  100% {
    background-position: 0% 50%, 100% 50%, 50% 50%;
  }
`;

const App = () => {
  const theme = useTheme();
  const {userInfo} = useSelector( state => state.userAuth)



  return (
    <UserSocketProvider id="sample-test" idName="test-2" className="class-test">
      <Box
        sx={{
          backgroundColor : userInfo?.color_theme?.background_color || '#ffffff',
          backgroundImage: userInfo?.color_theme?.background_image||'linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%)',
          paddingBottom: "10px",
          minHeight: "100vh", // Ensure the background color covers the whole viewport
          color: theme.palette.secondary.main,
        }}
      >
        <Box
          sx={{
            overflowX: "auto", // Enable horizontal scrolling
            maxHeight: "100vh", // Limit the height to the viewport height
            overflowY: "auto", // Enable vertical scrolling
            maxWidth: "100vw",
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1000, // Ensure the header stays on top of other elements

              boxShadow: theme.shadows[4], // Add some shadow for better visual separation
            }}
          >
            <SwitchHeaders />
          </Box>
          <Box sx={{ maxWidth: "100vw", overflowX: "auto" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </UserSocketProvider>
  );
};

export default App;

