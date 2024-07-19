import React from 'react';
import { Paper, Toolbar, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';

const Wrapper = styled('div')({
  margin: '0 10px',  // 40px margin on all sides
  paddingBottom:'10px'
  
});

const HeaderContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(6px) saturate(150%)',
  WebkitBackdropFilter: 'blur(6px) saturate(150%)', // For Safari support
  border: '1px solid rgba(209, 213, 219, 0.3)', // Semi-transparent border
  boxShadow: theme.shadows[3],
  transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease', // Smooth transition
  padding: '30px 20px 5px 20px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',  // Optional: rounded corners
  minWidth:'fit-content',
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem', // Small devices
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '3rem', // Medium devices
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '3.5rem', // Large devices
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '4rem', // Extra large devices
  },
}));

const MottoText = styled(Typography)(({ theme }) => ({
  fontStyle: 'italic',
  minWidth: '180px', // Minimum width for the motto text
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

const Header = () => {

  const {logoTransparentImage : logoImage} = useSelector( state => state.logoImage)


  return (
    <Wrapper>
      <HeaderContainer elevation={3}>
        <Toolbar sx={{display: 'flex', justifyContent:'space-between'}}>
        <Logo sx={{ maxWidth: 'fit-content', paddingRight: '0px' }} onClick={()=> {navigate('/')}}>
                      { (logoImage) ? (<LogoImageContainer src={logoImage} alt="Logo" />) :
                      (<LogoText variant="h2" sx={{width:'fit-content', paddingRight:'0px'}}>VerGno</LogoText>)
                      }
        </Logo>
          <Box display="flex" alignItems="center" justifyItems="flex-end" justifyContent="flex-end">
            <MottoText variant="h5">Knowledge, Truth.</MottoText>
          </Box>
        </Toolbar>
      </HeaderContainer>
    </Wrapper>
  );
};

export default Header;
