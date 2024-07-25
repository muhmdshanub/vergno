import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Profile from '../components/profile/ProfileContainer'; 
import ProfileInfoHeaderSkeleton from '../components/skeletons/ProfileInfoHeader';
import { useGetUserProfileCardInfoQuery, useUpdateProfilePhotoMutation, useUpdateProfileNameMutation } from '../slices/api_slices/profileApiSlice';
import QueryFeeds from '../components/profile/QueryFeeds'; // Adjust the path as necessary
import { useParams } from 'react-router-dom';
import PerspectiveFeeds from '../components/profile/PerspectiveFeed';
import SavedPostsFeed from '../components/profile/SavedPostsFeed'
import About from '../components/profile/About';
import { useDispatch, useSelector } from 'react-redux';
import { setUserCredentials } from '../slices/userAuthSlice';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

// Custom styled Tab component
const StrongTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold', // Make the tab label bold
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  color: "#fc03a1", // Use the default text color
  '&.Mui-selected': {
    color: "#ff94d8", // Use a different color for the selected tab label
  },
  '& .MuiTabs-indicator': {
    backgroundColor: "#ff94d8", // Customize the indicator color for the selected tab
  },
}));



const options = [
  { text: 'Queries', component: <QueryFeeds />}, 
  {text:'Perspectives', component : <PerspectiveFeeds />},
  {text:'About', component : <About />},
  {text: 'Saved', component : <SavedPostsFeed />}
  // You can add more tabs here for Perspectives and About later
];




const ProfileScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.userAuth.userInfo);
  const { '*': subpath } = useParams();
  const [value, setValue] = useState(0);

  // Fetch user profile card info using query hook
  const { data: userProfileData, error: userProfileError, isLoading: userProfileLoading, refetch: refetchUserProfile } = useGetUserProfileCardInfoQuery();

  // Mutation hooks for updating profile photo and name
  const [updateProfilePhoto, { isLoading: isProfilePhotoLoading}] = useUpdateProfilePhotoMutation();
  const [updateProfileName, { isLoading: nameUpdateLoading }] = useUpdateProfileNameMutation();

  // Update handlers
  const handleUpdateProfilePhoto = async (formData) => {
    try {
      const result = await updateProfilePhoto(formData);
      
      if (result?.data?.success) {
        // Update userInfo in Redux state
        const updatedUserInfo = { ...userInfo, image: result.data.image.url };

        
        dispatch(setUserCredentials({userData:updatedUserInfo})); // Dispatch action to update userInfo

        console.log('Image uploaded successfully');
        refetchUserProfile(); // Refetch profile data after successful update
      }
      
      
    } catch (error) {
      console.error('Error updating profile photo:', error); // Handle error
    }
  };

  const handleUpdateProfileName = async (newName) => {
    try {
      const result = await updateProfileName({ newName });
      
      if (result?.data?.success) {
        console.log(result?.message);

        // Update userInfo in Redux state
        const updatedUserInfo = { ...userInfo, name: newName.trim() };
        dispatch(setUserCredentials({userData:updatedUserInfo})); // Dispatch action to update userInfo
        console.log(userInfo)
      }
      refetchUserProfile(); // Refetch profile data after successful update
    } catch (error) {
      console.error('Error updating profile name:', error); // Handle error
    }
  };

  // Handle tab change
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    // Set initial tab selection based on subpath
    if (subpath === 'queries') {
      setValue(0);
    } else if(subpath === 'perspectives'){
      setValue(1);
    }else if(subpath === 'about'){
      setValue(2);
    }else {
      setValue(0); // Default to Profile Info
    }
  }, [subpath]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={10} lg={8} sx={{ margin: '0 auto' }}>
        {/* Profile Info section */}
        <Box sx={{ bgcolor: 'lightblue', minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          
      
          
          {userProfileLoading ? <ProfileInfoHeaderSkeleton /> : (
            <Profile
              name={userProfileData?.name}
              followers={userProfileData?.followers}
              following={userProfileData?.following}
              profilePicture={userProfileData?.image}
              onUpdateProfilePhoto={handleUpdateProfilePhoto} // Pass update photo handler to Profile component
              onUpdateProfileName={handleUpdateProfileName} // Pass update name handler to Profile component
              isProfilePhotoLoading={isProfilePhotoLoading}
            />
          )}
        </Box>
        
        {/* Tabs section */}
        <Paper elevation={3} sx={{ width: '100%', position: "relative", backgroundColor:'transparent' }}>
          <AppBar position="static" sx={{ top: 0, zIndex: 10, paddingTop: "1rem", paddingBottom: '1rem', marginTop: "2rem", backgroundColor: "rgba(255, 255, 255, 0.65)" }} >
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              indicatorColor="secondary"
              textColor="secondary"
              aria-label="scrollable full width tabs example"
            >
              {options.map((option, index) => (
                <StrongTab key={`strong_tab_${index}`} label={option.text} {...a11yProps(index)} />
              ))}
            </Tabs>
          </AppBar>
          {options.map((option, index) => (
            <TabPanel key={`strong_tab_panel_${index}`} value={value} index={index} style={{ minHeight: "65vh" , width:'100%', margin:'auto'}} sx={{ backgroundColor: "#f0f3fa" , margin:'auto'}}>
              {value === index && (
                <>
                  {userProfileLoading ? <ProfileInfoHeaderSkeleton /> : (
                    option.component
                  )}
                </>
              )}
            </TabPanel>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ProfileScreen;


