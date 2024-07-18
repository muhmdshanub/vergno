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
import { useLocation } from 'react-router-dom';
import SuggestionTopics from '../components/topics/SuggestionsTopic';
import FollowingsTopics from '../components/topics/FollowingsTopics';


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
          <Typography>{children}</Typography>
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
  '& .MuiTab-labelIcon': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '& .MuiSvgIcon-root': {
    // Add custom styles to the scroll icon
    color: theme.palette.danger.main, // Change the color of the scroll icon
    fontWeight: 'bold', // Make the scroll icon bold
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



const options = [
  { text: 'Topics Suggestions', component: SuggestionTopics },
  { text: 'Following Topics', component: FollowingsTopics},
];

const TopicsScreen = () => {
  const theme = useTheme();
  const location = useLocation();
  const [value, setValue] = useState(0);


  useEffect(() => {
    if (location.state?.tab) {
      setValue(location.state.tab);
    }
  }, [location.state]);


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={2} sx={{backgroundColor:'transparent'}}>
      <Grid item xs={12} sm={12} md={11} lg={11} sx={{ margin: '0 auto', backgroundColor:'transparent' }}>
        <Paper elevation={3} sx={{ width: '100%', position:"relative", backgroundColor:'transparent' }}>
          <GlassmorphicAppBar position="static"  >
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
            <GlassmorphicTabPanel key={`strong_tab_panel_${index}`} value={value} index={index} style={{minHeight:"65vh",}}  >
                {value === index && <option.component />}
              </GlassmorphicTabPanel>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TopicsScreen;
