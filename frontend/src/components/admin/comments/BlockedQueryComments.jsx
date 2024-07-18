import React, { useState, useEffect } from 'react';
import {
  useGetAllBlockedQueryCommentsQuery,
  useUnblockQueryCommentFromAdminMutation,
  useDeleteQueryCommentFromAdminMutation,
} from '../../../slices/api_slices/adminApiSlice'; // Import the API hook
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import ErrorAlertDialog from '../ErrorAlertDialog';
import AllReportsForSingleComment from './AllReportsForSingleComment'; // Adjust import path as per your project structure

const columns = [
  { id: 'content', label: 'Comment Content', minWidth: 200 },
  { id: 'commented_by', label: 'Commented By', minWidth: 150 },
  { id: 'created_at', label: 'Commented At', minWidth: 170, align: 'center' },
  { id: 'like_count', label: 'Like Count', minWidth: 120, align: 'center' },
  { id: 'reply_count', label: 'Reply Count', minWidth: 120, align: 'center' },
  { id: 'report_count', label: 'Report Count', minWidth: 150, align: 'center' },
  { id: 'actions', label: 'Actions', minWidth: '100%', align: 'center' },
];

const BlockedQueryCommentsTable = () => {
  const [page, setPage] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [commentsData, setCommentsData] = useState([]);
  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const { data, error, isLoading, isSuccess, refetch } = useGetAllBlockedQueryCommentsQuery({
    pageNum: page + 1,
    limitNum: 10,
  });

  const [unblockQueryCommentFromAdmin, { isLoading: isLoadingUnblock }] = useUnblockQueryCommentFromAdminMutation();
  const [deleteQueryCommentFromAdmin, { isLoading: isLoadingDelete }] = useDeleteQueryCommentFromAdminMutation();

  useEffect(() => {
    if (isSuccess) {
      setCommentsData(data?.comments || []);
      setTotalComments(data?.total || 0);
    }
  }, [data, isSuccess]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch();
  };

  const handleUnblock = async (commentId) => {
    try {
      await unblockQueryCommentFromAdmin({ comment_Id: commentId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteQueryCommentFromAdmin({ comment_Id: commentId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleShowReports = async (commentId) => {
    setSelectedCommentId(commentId);
    setOpenModal(true);
  };

  const handleCloseReportsModal = () => {
    setOpenModal(false);
    setSelectedCommentId(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor:'#d4d5d6', marginBottom:'100px' }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" align="left" gutterBottom>
          Blocked Query Comments
        </Typography>
        <Typography variant="body1" align="left" color='green' gutterBottom>
          Here you can see all the comments of queries that are blocked
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 440, minHeight: '300px', backgroundColor:"#ffffff" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#000000' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth , backgroundColor: '#01396C',
                    color: '#ffffff',}}
                  
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
          {commentsData.map((comment) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={comment.comment_id} sx={{backgrounfColor:'#ffffff',
                '&:nth-of-type(odd)': {
                  backgroundColor: '#D4EAFF',
                },
                '&:last-child td, &:last-child th': {
                  border: 0,
                },
              }}>
                <TableCell>{comment.content}</TableCell>
                <TableCell>{comment.commented_by}</TableCell>
                <TableCell align="center">{new Date(comment.created_at).toLocaleString()}</TableCell>
                <TableCell align="center">{comment.like_count}</TableCell>
                <TableCell align="center">{comment.reply_count}</TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <span>{comment.report_count}</span>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleShowReports(comment.comment_id)}
                      style={{ marginLeft: '8px', backgroundColor: 'green' }}
                    >
                      Show Reports
                    </Button>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {comment.is_blocked && (
                      <>
                        <Button
                          onClick={() => handleUnblock(comment.comment_id)}
                          color="primary"
                          variant="contained"
                          sx={{ marginRight: '1rem' }}
                        >
                          Unblock
                        </Button>
                        <Button
                          onClick={() => handleDelete(comment.comment_id)}
                          color="secondary"
                          variant="contained"
                        >
                          {isLoadingDelete ? <CircularProgress size={24} /> : 'Delete'}
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={totalComments}
        rowsPerPage={10}
        page={page}
        onPageChange={handleChangePage}
      />

      <ErrorAlertDialog
        title="Error"
        message={errorContent}
        open={errorGenerated}
        onClose={() => setErrorGenerated(false)}
      />

      {/* Modal for showing reports */}
      {selectedCommentId !== null && (
        <AllReportsForSingleComment
          commentId={selectedCommentId}
          open={openModal}
          onClose={handleCloseReportsModal}
        />
      )}
    </Paper>
  );
};

export default BlockedQueryCommentsTable;
