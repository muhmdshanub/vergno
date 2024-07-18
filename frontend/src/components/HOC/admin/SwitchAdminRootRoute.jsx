import React from 'react';
import { useSelector } from 'react-redux';
import HomeAdminScreen from '../../../screens/admin/HomeAdminScreen.jsx';
import LoginAdminScreen from '../../../screens/admin/LoginAdminScreen.jsx';

const SwitchRootRoute = () => {
  const {adminInfo} = useSelector((state) => state.adminAuth);

  return (adminInfo ? <HomeAdminScreen /> : <LoginAdminScreen />)
};

export default SwitchRootRoute;
