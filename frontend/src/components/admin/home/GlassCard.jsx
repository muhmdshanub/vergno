import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const GlassCardWrapper = styled(Card)(({ theme }) => ({
cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '15px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.21)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',

  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
    background: 'rgba(255, 255, 255, 0.35)',
  },
}));

const CardContentCentered = styled(CardContent)(({ theme }) => ({
  textAlign: 'center',
}));

const GlassCard = ({ title, count }) => (
  <GlassCardWrapper>
    <CardContentCentered>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h4">{count}</Typography>
    </CardContentCentered>
  </GlassCardWrapper>
);

export default GlassCard;
