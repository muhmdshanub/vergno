import React from 'react'
import { useSelector } from 'react-redux';


const HomeAdminScreen = () => {



  const {adminInfo} = useSelector((state) => state.adminAuth);
  return (
    <div>
      HomeScreen 
      
      
     
  </div>
  )
}

export default HomeAdminScreen