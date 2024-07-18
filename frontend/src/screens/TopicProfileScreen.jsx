import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import SingleTopicProfileDetailsCard from '../components/topics/SingleTopicProfileDetailsCard';
import TopicQueryFeeds from '../components/topics/TopicQueryFeed';
import TopicPerspectiveFeeds from '../components/topics/TopicPerspectiveFeed';
import { useParams } from 'react-router-dom';

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
  color: "#ffffff", // Use the default text color
  '&.Mui-selected': {
    color: "#ffffff", // Use a different color for the selected tab label
  },
  '& .MuiTabs-indicator': {
    backgroundColor: "#ffffff", // Customize the indicator color for the selected tab
  },
}));

const GlassmorphicAppBar = styled(AppBar)(({ theme }) => ({
  top: 0,
  paddingTop: "1rem",
  paddingBottom: '1rem',
  marginTop: "2rem",
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(5px) saturate(150%)',
  WebkitBackdropFilter: 'blur(5px) saturate(150%)',
}));

const GlassmorphicTabPanel = styled(TabPanel)(({ theme }) => ({
  minHeight: "65vh",
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(5px) saturate(150%)',
  WebkitBackdropFilter: 'blur(5px) saturate(150%)',
  borderRadius: '15px',
}));




const TopicProfileScreen = () => {
  const theme = useTheme();
  const { topicId, '*': subpath } = useParams();
  const [value, setValue] = useState(0);

  
  
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
    }else {
      setValue(0); // Default to Profile Info
    }
  }, [subpath]);

  const options = [
    { text: 'Queries', component: <TopicQueryFeeds topicId = {topicId} />}, 
    {text:'Perspectives', component : <TopicPerspectiveFeeds topicId = {topicId} />},
    // You can add more tabs here for Perspectives and About later
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={10} lg={8} sx={{ margin: '0 auto' }}>
        {/* Profile Info section */}
        <Box sx={{ bgcolor: 'transparent', minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

            <SingleTopicProfileDetailsCard topicId={topicId} />
        </Box>
        
        {/* Tabs section */}
        <Paper elevation={3} sx={{ width: '100%', position: "relative", backgroundColor:'transparent' }}>
          <GlassmorphicAppBar position="static" >
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
          </GlassmorphicAppBar>
          {options.map((option, index) => (
            <GlassmorphicTabPanel key={`strong_tab_panel_${index}`} value={value} index={index} style={{ minHeight: "65vh" , width:'100%', margin:'auto'}} sx={{ margin:'auto'}}>
              {value === index && (
                
                    option.component
              )}
            </GlassmorphicTabPanel>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TopicProfileScreen;


