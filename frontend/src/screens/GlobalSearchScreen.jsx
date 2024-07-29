import React, { useState, useEffect } from 'react';
import { useTheme, styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation } from 'react-router-dom';
import PeopleResultsFeeds from '../components/globalSearch/PeopleResultsFeeds';
import TopicsResultsFeeds from '../components/globalSearch/TopicsResultsFeeds';
import QueryResultsFeeds from '../components/globalSearch/QueryResultsFeeds';
import PerspectiveResultsFeeds from '../components/globalSearch/PerspectiveResultsFeeds';
import AllResultsFeeds from '../components/globalSearch/AllResultsFeeds';



// Placeholder components for each tab
const AllResults = () => <div>All Results</div>;
const PeopleResults = () => <div>People Results</div>;
const TopicResults = () => <div>Topic Results</div>;
const QueryResults = () => <div>Query Results</div>;
const PerspectiveResults = () => <div>Perspective Results</div>;

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
          <>{children}</>
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

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  display: "flex",
  alignItems: "center",
  borderRadius: '3.5px',
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(8px) saturate(180%)',
  WebkitBackdropFilter: 'blur(8px) saturate(180%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[1],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
    boxShadow: theme.shadows[4], // Increase box shadow on hover
  },
  marginLeft: '2rem',
  marginBottom: '0rem',
  width: '100%', // Take full width
  height: "3rem",
  [theme.breakpoints.up('md')]: {
    marginLeft: theme.spacing(1),
    width: '100%', // Take full width
  },
  [theme.breakpoints.up('lg')]: {
    marginLeft: theme.spacing(1),
    width: '100%', // Take full width
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  cursor: 'pointer',
  '&:hover': {
    color: alpha(theme.palette.secondary.main, 1),
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%', // Take full width
    [theme.breakpoints.up('sm')]: {
      width: '100%', // Take full width
      '&:focus': {
        width: '100%', // Take full width
      },
    },
  },
}));

const searchOptions = [
  { text: 'All', component: AllResultsFeeds },
  { text: 'Peoples', component: PeopleResultsFeeds },
  { text: 'Topics', component: TopicsResultsFeeds },
  { text: 'Queries', component: QueryResultsFeeds },
  { text: 'Perspectives', component: PerspectiveResultsFeeds },
];

const GlobalSearchScreen = () => {
  const theme = useTheme();
  const location = useLocation();
  const [searchBy, setSearchBy] = useState('')
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
    <Grid container spacing={2} sx={{ backgroundColor: 'transparent' }}>
      <Grid item xs={12} sm={12} md={11} lg={11} sx={{ margin: '0 auto', backgroundColor: 'transparent' }}>
        <Paper elevation={0} sx={{ width: '100%', position: "relative", backgroundColor: 'transparent' }}>
          {/* Independent Search Input */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt:3 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
              />
            </Search>
          </Box>
          <GlassmorphicAppBar position="static">
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
              {searchOptions.map((option, index) => (
                <StrongTab key={`strong_tab_${index}`} label={option.text} {...a11yProps(index)} />
              ))}
            </Tabs>
          </GlassmorphicAppBar>
          {searchOptions.map((option, index) => (
            <GlassmorphicTabPanel key={`strong_tab_panel_${index}`} value={value} index={index} style={{ minHeight: "65vh" }}>
              {value === index && <option.component searchBy={searchBy} selectedTabValue={value} setSelectedTabValue={setValue} />}
            </GlassmorphicTabPanel>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default GlobalSearchScreen;
