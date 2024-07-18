import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import BlockedQueryAnswersTable from '../../components/admin/answers/BlockedAnswersTable';
// import BlockedQueryCommentsTable from '../../components/admin/comments/BlockedQueryComments'; // Import your component here
// import BlockedPerspectiveCommentsTable from '../../components/admin/comments/BlockedPerspectiveComment';

const AnswerManagementScreen = () => {
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 1200, my: 4, p: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Answer Management
          </Typography>
          <Typography variant="body1" align="center" color='green'>
            Manage blocked answers and more.
          </Typography>
        </Box>

         <BlockedQueryAnswersTable /> 
        {/*
        <Box >
          <BlockedPerspectiveCommentsTable />
        </Box> */}
        
        {/* You can add more components related to comment management */}
      </Paper>
    </Box>
  );
};

export default AnswerManagementScreen;
