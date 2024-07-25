import React,{useState, useEffect} from 'react';
import { styled, alpha } from '@mui/material/styles';
import {Divider, List, ListItem, ListItemText, ListItemButton, ListItemIcon} from'@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Drawer from '@mui/material/Drawer';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {  useTheme, useMediaQuery } from '@mui/system';
import WifiFindIcon from '@mui/icons-material/WifiFind';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TagIcon from '@mui/icons-material/Tag';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import { Card, CardContent, Grid } from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLogout } from '../../slices/userAuthSlice'; // Assuming you have a logout action in userAuthSlice
import { useLogoutMutation } from '../../slices/api_slices/userApiSlice';
import { useUnreadNotificationsCountQuery } from '../../slices/api_slices/notificationsApiSlice';
import { useUnreadMessageCountQuery } from '../../slices/api_slices/messagesApiSlice';
import {  setUnreadCount } from '../../slices/notificationCountSlice';
import { setUnreadMessageCount } from '../../slices/messageCountSlice';

const GlassmorphicAppBar = styled(AppBar)(({ theme }) => ({
  overflowX: 'auto',
  minWidth:"fit-content",
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(6px) saturate(150%)',
  WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  minWidth: 'fit-content',
}));

const LogoImageContainer = styled('img')(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px) saturate(180%)',
  WebkitBackdropFilter: 'blur(8px) saturate(180%)',
  height: '50px', // Adjust the height as needed
  [theme.breakpoints.down('sm')]: {
    height: '30px',
  },
  [theme.breakpoints.up('md')]: {
    height: '50px',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: '#1976d2',
  fontWeight: 'bold',
  minWidth: 'fit-content', // Minimum width for the logo text
  cursor: "pointer",
  [theme.breakpoints.up('xs')]: {
    fontSize: '2rem', // Small devices
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.3rem', // Medium devices
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2.8rem', // Large devices
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '3.3rem', // Extra large devices
  },
}));



const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  display: "flex",
  alignItems:"center",
  borderRadius: '3.5px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  width: '150px',
  height:"3rem",
  [theme.breakpoints.up('md')]: {
    marginLeft: theme.spacing(1),
    width: '180px',
    
  },
  [theme.breakpoints.up('lg')]: {
    marginLeft: theme.spacing(1),
    width: '200px',
    
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
  '&:hover': {
    color: alpha(theme.palette.secondary.main, 1),
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const GlassmorphicIconButton = styled(IconButton)(({theme}) =>({
  
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(10px) saturate(200%)',
    WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
    border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
    boxShadow: theme.shadows[3],
    marginRight: '1rem',
    transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.55)', // Slightly more opaque background
      border: '1px solid rgba(209, 213, 219, 0.4)', // Slightly more opaque border
      boxShadow: theme.shadows[6], // Increase box shadow on hover
    },
  
}))


const FeatureButton = ({ icon, label,destinationRoute, theme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const handleClick = () => {
    navigate(destinationRoute);
  };

  const isSelectedNav = destinationRoute === location.pathname;
  
  return (
        <Card onClick={handleClick} 
        sx={{ 
          cursor: "pointer",
          textAlign: 'center', 
          justifyContent:'center',
          margin: '10px', 
          boxShadow: 3, 
          backgroundColor: 'rgba(255, 255, 255, 1)', // Full white if selected, else slightly transparent
        backdropFilter: 'blur(10px) saturate(200%)',
        WebkitBackdropFilter: 'blur(10px) saturate(200%)', // For Safari support
        borderRadius: '8px',
        border: isSelectedNav ? `2px solid #0085FF` : '',
        height: '5.2rem',
        width: '6rem',
        minWidth: '50px',
        '&:hover': {
          boxShadow: 6,
          backgroundColor:  'rgba(255, 255, 255, 1)', // Slightly more opaque on hover
        },
          [theme.breakpoints.down('lg')]: {
          
            width:'6rem',
          },
          [theme.breakpoints.down('md')]: {
          
            width:'6rem',
            margin:'5px'
          },
        }}>
          <CardContent>
            <IconButton >
              {icon}
            </IconButton>
            <Box  sx={{cursor: "pointer",}}>
              {label}
            </Box>
          </CardContent>
        </Card>
      )};


function UserHeader() {

   // Fetch unread notification count from API
  const { data: unreadNotificationsCount, isLoading, isSuccess } = useUnreadNotificationsCountQuery();
  const {data: unreadMessageCountData, isLoading : messageCountLoading, isSuccess : messageCountSuccess} = useUnreadMessageCountQuery();

  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {logoTransparentImage : logoImage} = useSelector( state => state.logoImage)

  const [logoutApiCall] = useLogoutMutation();

  const isMediumUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeUp =  useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallUp = useMediaQuery(theme.breakpoints.up('sm'));



 
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  

  const {userInfo} = useSelector((state) => state.userAuth); 
  const {unreadCount} = useSelector( state => state.notificationsCount)
  const {unreadMessageCount} = useSelector( state => state.messageCount)





  useEffect(() => {
    if (unreadNotificationsCount) {
      dispatch(setUnreadCount(unreadNotificationsCount.unreadCount || 0));
    }
  }, [unreadNotificationsCount, dispatch]);

  useEffect(()=>{
    if (unreadMessageCountData && messageCountSuccess) {
      dispatch(setUnreadMessageCount(unreadMessageCountData.unreadMessageCount || 0));
      
    }
  },[unreadMessageCountData, messageCountSuccess])


  

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout  = async () => {
    
    try {
      await logoutApiCall().unwrap();
      dispatch(userLogout());
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileClick =()=>{
    navigate('/profile')
  }

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  const handleChatsClick = () => {
    navigate("/chats");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const settings = [{name:"Profile", function : handleProfileClick},{name:"Logout",function:handleLogout}];

  const features = [
    { name: 'Peoples', icon: <GroupAddIcon /> , path:"/peoples"},
    // { name: 'Groups', icon: <Diversity2Icon />, path:"/groups" },
    { name: 'Topics', icon: <TagIcon /> , path:"/topics"},
    { name: 'Discovery', icon: <WifiFindIcon />, path:"/discovery" },
  ];

  const fallbackImage = './profile.png';
  const minWidthStyle = !isSmallUp ? '400px' : '960px';

  return (
    <GlassmorphicAppBar position="static" >
      <Container maxWidth="xl" sx={{
          minWidth: minWidthStyle, // Set minimum width here
          overflowX: 'auto', // Allow horizontal scrolling if needed
        }}>
        <Toolbar disableGutters>
          <Grid container alignItems="center">

          {isLargeUp && (

            <>

                  <Grid item  md={5} lg={4} container alignItems="flex-end">

                    <Logo sx={{ maxWidth: 'fit-content', paddingRight: '0px' }} onClick={()=> {navigate('/')}}>
                      { (logoImage) ? (<LogoImageContainer src={logoImage} alt="Logo" />) :
                      (<LogoText variant="h2" sx={{width:'fit-content', paddingRight:'0px'}}>VerGno</LogoText>)
                      }
                    </Logo>

                    <Search>
                      <SearchIconWrapper>
                        <SearchIcon />
                      </SearchIconWrapper>
                      <StyledInputBase
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                      />
                    </Search>
                  </Grid>

                  <Grid item  md={5} lg={5} container justifyContent="center">
                    {features.map((feature) => (
                      <FeatureButton key={feature.name} icon={feature.icon} label={feature.name} destinationRoute={feature.path} theme={theme} />
                    ))}
                  </Grid>

                  <Grid item  md={2} lg={3} container justifyContent="flex-end" alignItems="top" style={{marginBottom:'1rem', paddingBottom:'0.5rem'}}>
                    <div style={{justifyContent:'space-between',marginRight:'2.5rem', alignItems:'center', alignContents:'center'}}>
                      <GlassmorphicIconButton size="large" aria-label={`show ${unreadMessageCount} new mails`} color="info"  onClick={handleChatsClick}>
                        <Badge badgeContent={unreadMessageCount} color="error">
                          <MailIcon />
                        </Badge>
                      </GlassmorphicIconButton>
                      <GlassmorphicIconButton
                        onClick={handleNotificationsClick}
                        size="large"
                        aria-label={`show ${unreadCount} new notifications`}
                        color="info"
                      >
                        <Badge badgeContent={unreadCount} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </GlassmorphicIconButton>
                    </div>
                    <Tooltip title="Open settings">
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        
                        <Avatar alt={userInfo.name} src={userInfo.image || fallbackImage} style={{ width: '3.5rem', height: '3.5rem' }} />
                        
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar"
                      anchorEl={anchorElUser}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                    >
                      {settings.map((setting) => (
                        <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                          <Typography textAlign="center" onClick={setting.function}>{setting.name}</Typography>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Grid>
            
            </>
          ) } 
          
          {(!isLargeUp && isSmallUp) && (

            <>
              
              <Grid item xs={2}  container alignItems="center" justifyContent='center' minWidth="150px" maxWidth="250px">
                <Logo sx={{ maxWidth: 'fit-content', paddingRight: '0px' }} onClick={()=> {navigate('/')}}>
                        { (logoImage) ? (<LogoImageContainer src={logoImage} alt="Logo" />) :
                        (<LogoText variant="h2" sx={{width:'fit-content', paddingRight:'0px'}}>VerGno</LogoText>)
                        }
                      </Logo>
                </Grid>

              <Grid item xs={8} container alignItems="center"   width="500px">
                  <Grid item sm={12} container alignItems="center" justifyContent='center' width="400px">

                        <Grid item sm={6} container alignItems="center" justifyContent='center'  width="200px" paddingLeft="1.5rem">
                                    <Search>
                                          <SearchIconWrapper>
                                            <SearchIcon />
                                          </SearchIconWrapper>
                                          <StyledInputBase
                                            placeholder="Search…"
                                            inputProps={{ 'aria-label': 'search' }}
                                          />
                                </Search>
                        </Grid>
                        <Grid item sm={6} container alignItems="center" justifyContent='center' width="200px" >
                                  <GlassmorphicIconButton size="large" aria-label={`show ${unreadMessageCount} new mails`} color="info"   onClick={handleChatsClick}>
                                      <Badge badgeContent={unreadMessageCount} color="error">
                                        <MailIcon />
                                      </Badge>
                                </GlassmorphicIconButton>
                                <GlassmorphicIconButton
                                  onClick={handleNotificationsClick}
                                  size="large"
                                  aria-label={`show ${unreadCount} new notifications`}
                                  color="info"
                                >
                                  <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon />
                                  </Badge>
                                </GlassmorphicIconButton>
                        </Grid>
                  
                  </Grid>
                  <Grid item sm={12} container alignItems="center" justifyContent='center' width="500px">
                          {features.map((feature) => (
                              <FeatureButton key={feature.name} icon={feature.icon} label={feature.name} destinationRoute={feature.path} theme={theme} />
                            ))}
                  </Grid>
              </Grid>

              <Grid item xs={2} container alignItems="center" justifyContent='center' minWidth="100" maxWidth="150px">
                        <Tooltip title="Open settings">
                          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            
                            <Avatar alt={userInfo.name} src={userInfo.image?.url || userInfo.image || fallbackImage} style={{ width: '3.5rem', height: '3.5rem' }} />
                            
                          </IconButton>
                        </Tooltip>
                        <Menu
                          sx={{ mt: '45px' }}
                          id="menu-appbar"
                          anchorEl={anchorElUser}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          open={Boolean(anchorElUser)}
                          onClose={handleCloseUserMenu}
                        >
                          {settings.map((setting) => (
                        <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                          <Typography textAlign="center" onClick={setting.function}>{setting.name}</Typography>
                        </MenuItem>
                      ))}
                        </Menu>
              </Grid>
              
            </>

          )}

          {(!isSmallUp) && (

            <>
              
              <Grid item xs={12}  container alignItems="center" justifyContent='space-between' width="400px">
                    <Logo sx={{ maxWidth: 'fit-content', paddingRight: '0px' }} onClick={()=> {navigate('/')}}>
                      { (logoImage) ? (<LogoImageContainer src={logoImage} alt="Logo" />) :
                      (<LogoText variant="h2" sx={{width:'fit-content', paddingRight:'0px'}}>VerGno</LogoText>)
                      }
                    </Logo>

                  <Tooltip title="Open settings">
                          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            
                            <Avatar alt={userInfo.name} src={ userInfo.image || fallbackImage} style={{ width: '3.5rem', height: '3.5rem' }} />
                            
                          </IconButton>
                  </Tooltip>
                        <Menu
                          sx={{ mt: '45px' }}
                          id="menu-appbar"
                          anchorEl={anchorElUser}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          open={Boolean(anchorElUser)}
                          onClose={handleCloseUserMenu}
                        >
                          {settings.map((setting) => (
                        <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                          <Typography textAlign="center" onClick={setting.function}>{setting.name}</Typography>
                        </MenuItem>
                      ))}
                        </Menu>
              </Grid>

              <Grid item xs={12}  container alignItems="center" justifyContent='space-between' width="400px">
                    
                {/* Drawer button goes here */}

                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                  >
                    <MenuIcon />
                  </IconButton>

                <Search style={{width:'200px'}}>
                         <SearchIconWrapper>
                               <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                           placeholder="Search…"
                           inputProps={{ 'aria-label': 'search' }}
                        />
                </Search>

                <div style={{alignItems:'center', justifyContent:'center'}}>
                                    <GlassmorphicIconButton size="large" aria-label={`show ${unreadMessageCount} new mails`} color="info"   onClick={handleChatsClick}>
                                          <Badge badgeContent={unreadMessageCount} color="error">
                                            <MailIcon />
                                          </Badge>
                                    </GlassmorphicIconButton>
                                    <GlassmorphicIconButton
                                      onClick={handleNotificationsClick}
                                      size="large"
                                      aria-label={`show ${unreadCount} new notifications`}
                                      color="info"
                                    >
                                      <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon />
                                      </Badge>
                                    </GlassmorphicIconButton>
                  </div>  

                  
                  <Drawer
                    variant="temporary"
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                      keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                      display: { xs: 'block', sm: 'none' },
                      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                  >
                    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
                      <Logo sx={{ maxWidth: 'fit-content', paddingRight: '0px' }}>
                        { (logoImage) ? (<LogoImageContainer src={logoImage} alt="Logo" />) :
                        (<LogoText variant="h2" sx={{width:'fit-content', paddingRight:'0px'}}>VerGno</LogoText>)
                        }
                      </Logo>
                      <Divider />
                      <List>
                        {features.map((feature) => (
                          <ListItem key={feature.name} disablePadding>
                            <ListItemButton sx={{ textAlign: 'center' }}>
                              <FeatureButton key={feature.name} icon={feature.icon} label={""} destinationRoute={feature.path} theme={theme} />
                              <ListItemText primary={feature.name} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Drawer>


              </Grid>
              
              
            </>

          )}


            
          </Grid>
        </Toolbar>
      </Container>
    </GlassmorphicAppBar>
  );
}
export default UserHeader;