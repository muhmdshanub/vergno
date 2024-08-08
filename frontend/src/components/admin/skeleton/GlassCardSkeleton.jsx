import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';
import { styled } from '@mui/system';

const GlassCardWrapper = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.65)',
  borderRadius: '15px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.21)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',

}));

const CardContentCentered = styled(CardContent)(({ theme }) => ({
  textAlign: 'center',
}));

const GlassCardSkeleton = () => (
  <GlassCardWrapper>
    <CardContentCentered>
      <Skeleton variant="text" width="60%" height={30} />
      <Skeleton variant="text" width="40%" height={50} />
    </CardContentCentered>
  </GlassCardWrapper>
);

export default GlassCardSkeleton;
