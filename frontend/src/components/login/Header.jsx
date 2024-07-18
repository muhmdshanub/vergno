import React from 'react';
import { Paper, Toolbar, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const Wrapper = styled('div')({
  margin: '0 40px',  // 40px margin on all sides
  
});

const HeaderContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  color: theme.palette.text.primary,
  padding: '30px 20px 5px 20px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',  // Optional: rounded corners
  minWidth:'fit-content'
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: '#1976d2',
  fontWeight: 'bold',
  minWidth: '250px', // Minimum width for the logo text
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
  return (
    <Wrapper>
      <HeaderContainer elevation={3}>
        <Toolbar>
          <Logo>
            <LogoText variant="h2">VerGno</LogoText>
          </Logo>
          <Box display="flex" alignItems="center">
            <MottoText variant="h5">Knowledge, Truth.</MottoText>
          </Box>
        </Toolbar>
      </HeaderContainer>
    </Wrapper>
  );
};

export default Header;
