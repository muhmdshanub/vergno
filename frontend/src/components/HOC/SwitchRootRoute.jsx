import React from 'react';
import { useSelector } from 'react-redux';
import HomeScreen from '../../screens/HomeScreen.jsx';
import LoginScreen from '../../screens/LoginScreen.jsx';

const SwitchRootRoute = () => {
  const {userInfo} = useSelector((state) => state.userAuth);

  return (userInfo ? <HomeScreen /> : <LoginScreen />)
};

export default SwitchRootRoute;
