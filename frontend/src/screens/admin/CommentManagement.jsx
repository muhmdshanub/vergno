import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import BlockedQueryCommentsTable from '../../components/admin/comments/BlockedQueryComments'; // Import your component here
import BlockedPerspectiveCommentsTable from '../../components/admin/comments/BlockedPerspectiveComment';

const CommentManagementScreen = () => {
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 1200, my: 4, p: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Comment Management
          </Typography>
          <Typography variant="body1" align="center" color='green'>
            Manage blocked comments and more.
          </Typography>
        </Box>
        <BlockedQueryCommentsTable /> {/* Include your table component here */}
        <Box >
          <BlockedPerspectiveCommentsTable />
        </Box>
        
        {/* You can add more components related to comment management */}
      </Paper>
    </Box>
  );
};

export default CommentManagementScreen;
