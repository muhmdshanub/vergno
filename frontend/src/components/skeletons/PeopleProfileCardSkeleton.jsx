import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const PeopleProfileCardSkeleton = () => {
  return (
    <Card sx={{ padding: "10px" }}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center">
          <Skeleton variant="circular" width={80} height={80} sx={{ marginBottom: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ marginBottom: 2 }} />
          <Skeleton variant="rectangular" width="50%" height={40} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PeopleProfileCardSkeleton;
