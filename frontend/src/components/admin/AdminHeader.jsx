


import React, { useState, useRef } from 'react';
import { Paper, Toolbar, Typography, Box, Button, IconButton, Backdrop,Drawer, Divider, List, ListItem, ListItemText, Hidden } from '@mui/material';
import {Menu} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '../../slices/adminAuthSlice';
import { useAdminLogoutMutation } from '../../slices/api_slices/adminApiSlice';
import LoadingModal from '../LoadingModal';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Wrapper = styled('div')({
  margin: '0',  // 40px margin on all sides
});

// const HeaderContainer = styled(Paper)(({ theme }) => ({
//   backgroundColor: '#0C1844',
//   color: theme.palette.text.primary,
//   padding: '5px',
//   borderBottom: `1px solid ${theme.palette.divider}`,
//   borderRadius: '8px',  // Optional: rounded corners
//   minWidth: '100%'
// }));

const HeaderContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(12, 24, 68, 0.5)', // Semi-transparent background
  backdropFilter: 'blur(5px) saturate(150%)', // Blur effect
  WebkitBackdropFilter: 'blur(5px) saturate(150%)', // For Safari
  color: theme.palette.text.primary,
  padding: '5px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',  // Optional: rounded corners
  minWidth: '100%',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Subtle shadow
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  minWidth: 'fit-content',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: '#1976d2',
  fontWeight: 'bold',
  minWidth: 'fit-content',
  [theme.breakpoints.down('sm')]: {
    fontSize: theme.typography.h5.fontSize,
  },
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: theme.typography.h4.fontSize,
  },
  [theme.breakpoints.up('md')]: {
    fontSize: theme.typography.h3.fontSize,
  },
}));


const LogoImageContainer = styled('img')(({ theme }) => ({
  height: '50px', // Adjust the height as needed
  [theme.breakpoints.down('sm')]: {
    height: '30px',
  },
  [theme.breakpoints.up('md')]: {
    height: '50px',
  },
}));


const LogoutButton = styled(Button)(({ theme }) => ({
  color: '#C80036',
  backgroundColor: "#FFF5E1",
  fontStyle: 'italic',
  width: 'fit-content',
  [theme.breakpoints.down('xs')]: {
    fontSize: '1rem', // Small devices
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.25rem', // Medium devices
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.5rem', // Large devices
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '1.75rem', // Extra large devices
  },
}));

const NavContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  overflowX: 'auto',
  
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    display: 'none', // Hide default scrollbar
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  minWidth: 'fit-content',
  margin: '0 8px',
}));

const ScrollButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  margin: '0 8px',
}));

const AdminHeader = () => {

  const {logoImage} = useSelector( state => state.logoImage)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [logoutAdminApiCall, { isLoading }] = useAdminLogoutMutation();
  const [logoutResponseError, setLogoutResponseError] = useState(null);

  const navContainerRef = useRef(null);

  const handleAdminLogout = async () => {
    console.log("logout clicked");
    try {
      await logoutAdminApiCall().unwrap();
      dispatch(logoutAdmin());
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setLogoutResponseError(err);
    }
  };

  const scrollLeft = () => {
    navContainerRef.current.scrollLeft -= 100;
  };

  const scrollRight = () => {
    navContainerRef.current.scrollLeft += 100;
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Wrapper>
      <HeaderContainer elevation={3}>
        <Toolbar sx={{display:'flex', justifyContent:'space-between', paddingLeft:'0px', paddingRight:'0px'}}>

          {/* Inside your component's return */}
          <Hidden mdUp>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <Menu />
            </IconButton>
          </Hidden>


          {/* <Logo sx={{maxWidth:'fit-content', paddingRight:'0px'}}>
            
          </Logo> */}

          <Logo sx={{ maxWidth: 'fit-content', paddingRight: '0px' }}>
            { (logoImage) ? (<LogoImageContainer src={logoImage} alt="Logo" />) :
            (<LogoText variant="h2" sx={{width:'fit-content', paddingRight:'0px'}}>VerGno</LogoText>)
            }
          </Logo>

          <Hidden mdDown>
              <Box sx={{display:'flex', color:"#000000", alignItems:'center', alignContents:'center',marginLeft:'0px',  width: {
                    
                    md: '450px', // Medium screens
                    lg: '900px', // Large screens
                    xl: '1100px' // Extra-large screens
                  },
                  height: {
                    
                    md: '120px', // Medium screens
                    lg: '140px', // Large screens
                    xl: '160px' // Extra-large screens
                  },}}>
                  <ScrollButton onClick={scrollLeft} style={{color:"#000000",backgroundColor:"#ffffff", display:'flex', justifyContent:'center', justidyItems:'center'}}>
                    <ArrowBackIosIcon />
                  </ScrollButton>
                  <NavContainer ref={navContainerRef} >
                    <NavButton onClick={() => navigate('/admin/user-management')} style={{color:"#000000",backgroundColor:"#ffffff", padding:'15px'}}>User Management</NavButton>
                    <NavButton onClick={() => navigate('/admin/query-management')} style={{color:"#000000",backgroundColor:"#ffffff", padding:'15px'}}>Query Management</NavButton>
                    <NavButton onClick={() => navigate('/admin/perspective-management')} style={{color:"#000000",backgroundColor:"#ffffff", padding:'15px'}}>Perspective</NavButton>
                    <NavButton onClick={() => navigate('/admin/comment-management')} style={{color:"#000000",backgroundColor:"#ffffff", padding:'15px'}}>Comment Management</NavButton>
                    <NavButton onClick={() => navigate('/admin/answer-management')} style={{color:"#000000",backgroundColor:"#ffffff", padding:'15px'}}>Answer Management</NavButton>
                    <NavButton onClick={() => navigate('/admin/topics-management')} style={{color:"#000000",backgroundColor:"#ffffff", padding:'15px'}}>Topics Management</NavButton>
                  </NavContainer>
                  <ScrollButton onClick={scrollRight} style={{color:"#000000",backgroundColor:"#ffffff"}}>
                    <ArrowForwardIosIcon />
                  </ScrollButton>
              </Box>

          </Hidden>
          
          
          <LogoutButton variant="contained" onClick={handleAdminLogout}>
            Logout
          </LogoutButton>
        </Toolbar>

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
                      <LogoText variant="h6">VerGno</LogoText>
                      <Divider />
                      <List>
                            <ListItem button onClick={() => navigate('/admin/user-management')}>
                              <ListItemText primary="User Management" />
                            </ListItem>
                            <ListItem button onClick={() => navigate('/admin/query-management')}>
                              <ListItemText primary="Query Management" />
                            </ListItem>
                            <ListItem button onClick={() => navigate('/admin/perspective-management')}>
                              <ListItemText primary="Perspective" />
                            </ListItem>
                            <ListItem button onClick={() => navigate('/admin/comment-management')}>
                              <ListItemText primary="Comment Management" />
                            </ListItem>
                            <ListItem button onClick={() => navigate('/admin/answer-management')}>
                              <ListItemText primary="Answer Management" />
                            </ListItem>
                      </List>
                    </Box>
                  </Drawer>

        {isLoading && <LoadingModal />}

        {logoutResponseError && (
          <Backdrop open={true} style={{ zIndex: 9999 }}>
            <Box
              component="div"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: '10px',
                border: '2px solid #000',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
                backgroundColor: '#d5f2f7',
                color: theme.palette.error.main,
                position: 'relative',
                height: '50vh',
                width: '500px',
              }}
            >
              <div
                style={{
                  minWidth: '100%',
                  minHeight: '80px',
                  backgroundColor: '#fff',
                  margin: '0',
                  borderRadius: '10px',
                }}
              ></div>
              <Button
                onClick={() => setLogoutResponseError(null)}
                style={{
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.primary.main,
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                }}
              >
                Close
              </Button>
              <Typography variant="h6" color="info" style={{ position: 'absolute', bottom: '0', top: '20vh' }}>
                {logoutResponseError}
              </Typography>
            </Box>
          </Backdrop>

          
        )}
      </HeaderContainer>
    </Wrapper>
  );
};

export default AdminHeader;
