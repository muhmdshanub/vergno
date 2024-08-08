import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetInfoForHomeAdminQuery } from '../../slices/api_slices/adminApiSlice';
import ErrorAlertDialog from '../../components/ErrorAlertDialoge';
import { Grid, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/system';
import GlassCard from '../../components/admin/home/GlassCard';
import GlassCardSkeleton from '../../components/admin/skeleton/GlassCardSkeleton';

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
}));

const HomeAdminScreen = () => {
  const { data, error, isLoading, isError, isSuccess } = useGetInfoForHomeAdminQuery();
  const { adminInfo } = useSelector((state) => state.adminAuth);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  useEffect(() => {
    if (isError) {
      setErrorDialogOpen(true);
      setErrorDialogTitle('Error Fetching info');
      setErrorDialogMessage(error?.data?.message || 'Failed to fetch information.');
    }
  }, [isError, error]);



  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  // Array of objects with titles and corresponding count data
  const cardData = [
    { title: 'Total Users', count: 'userCount'  },
    { title: 'Online Users', count: 'onlineUserCount'  },
    { title: 'Total Topics', count: 'topicCount'  },
    { title: 'Total Queries', count: 'queryCount' },
    { title: 'Total Perspectives', count: 'perspectiveCount' },
  ];

  return (
    <Root>
      <Typography variant="h4" gutterBottom color='primary'>
        Admin Dashboard
      </Typography>

      {isLoading ? (
         <GridContainer container spacing={3}>
         {Array.from(new Array(cardData.length)).map((_, index) => (
           <Grid item xs={12} sm={6} md={4} key={index}>
             <GlassCardSkeleton />
           </Grid>
         ))}
       </GridContainer>
      ) : (
        <GridContainer container spacing={3}>
          {cardData.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <GlassCard title={card.title} count={data[card.count] || 0} />
            </Grid>
          ))}
        </GridContainer>
      )}

      {!!errorDialogOpen && (
        <ErrorAlertDialog
          open={errorDialogOpen}
          handleClose={handleCloseErrorDialog}
          title={errorDialogTitle}
          message={errorDialogMessage}
        />
      )}
    </Root>
  );
};

export default HomeAdminScreen;
