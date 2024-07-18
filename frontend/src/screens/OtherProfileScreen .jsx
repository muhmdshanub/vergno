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
import Profile from '../components/others-profile/ProfileContainer'; 
import QueryFeeds from '../components/others-profile/QueryFeeds'; // Adjust the path as necessary
import { useNavigate, useParams } from 'react-router-dom';
import PerspectiveFeeds from '../components/others-profile/PerspectiveFeed';
import About from '../components/others-profile/About';
import { useSelector } from 'react-redux';

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








const OtherProfileScreen = () => {
  const theme = useTheme();
  const {userInfo} = useSelector(state => state.userAuth);
  const navigate = useNavigate()
  const { userId, '*': subpath } = useParams();
  const [value, setValue] = useState(0);

  
  useEffect(()=>{
    if(userId === userInfo._id){
      navigate('/profile')
    }
  })
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

  const options = [
    { text: 'Queries', component: <QueryFeeds userId = {userId} />}, 
    {text:'Perspectives', component : <PerspectiveFeeds userId = {userId} />},
    {text:'About', component : <About userId = {userId} />}
    // You can add more tabs here for Perspectives and About later
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={10} lg={8} sx={{ margin: '0 auto' }}>
        {/* Profile Info section */}
        <Box sx={{ bgcolor: 'lightblue', minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          
            <Profile userId={userId}/>
        </Box>
        
        {/* Tabs section */}
        <Paper elevation={3} sx={{ width: '100%', position: "relative" }}>
          <AppBar position="static" sx={{ top: 0, zIndex: 10, paddingTop: "1rem", paddingBottom: '1rem', marginTop: "2rem", backgroundColor: "#f0f3fa" }} >
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
                
                    option.component
              )}
            </TabPanel>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OtherProfileScreen;


