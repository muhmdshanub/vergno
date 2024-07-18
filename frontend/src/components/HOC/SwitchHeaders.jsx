import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from "@mui/material";
import Header from '../login/Header';
import UserHeader from '../user/UserHeader';
import AdminHeader from '../admin/AdminHeader';

const SwitchHeaders = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { userInfo } = useSelector((state) => state.userAuth);
  const { adminInfo } = useSelector((state) => state.adminAuth);

  if (isAdminRoute && adminInfo) {
    return <AdminHeader />;
  }

  if (!isAdminRoute && userInfo) {
    return <UserHeader />;
  }

  return( 
    <Box sx={{paddingTop: "20px",}}>
      <Header />
  </Box>
  );
};

export default SwitchHeaders;
