import React from 'react';
import { Grid, Skeleton } from '@mui/material';

const ProfileInfoHeaderSkeleton = () => (
  <Grid container alignItems="center" spacing={2}>
    <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
      <Skeleton variant="circular" width={150} height={150} />
    </Grid>
    <Grid item xs={12} md={7} sx={{ textAlign: 'center' }}>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="text" width={150} height={20} />
    </Grid>
  </Grid>
);

export default ProfileInfoHeaderSkeleton;
