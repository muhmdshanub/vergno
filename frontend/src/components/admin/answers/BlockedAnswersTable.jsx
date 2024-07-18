import React, { useState, useEffect } from 'react';
import {
  useGetAllBlockedAnswersFromAdminQuery,
  useUnblockAnswerFromAdminMutation,
  useDeleteAnswerFromAdminMutation,
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
import ReportsModalForAnswers from './AllReportsForSingleAnswer';
//import AllReportsForSingleAnswer from './AllReportsForSingleAnswer'; // Adjust import path as per your project structure

const columns = [
  { id: 'content', label: 'Answer Content', minWidth: 200 },
  { id: 'answered_by', label: 'Answered By', minWidth: 150 },
  { id: 'created_at', label: 'Answered At', minWidth: 170, align: 'center' },
  { id: 'report_count', label: 'Report Count', minWidth: 150, align: 'center' },
  { id: 'actions', label: 'Actions', minWidth: '100%', align: 'center' },
];

const BlockedQueryAnswersTable = () => {
  const [page, setPage] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [answersData, setAnswersData] = useState([]);
  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const { data, error, isLoading, isSuccess, refetch } = useGetAllBlockedAnswersFromAdminQuery({
    pageNum: page + 1,
    limitNum: 10,
  });

  const [unblockQueryAnswerFromAdmin, { isLoading: isLoadingUnblock }] = useUnblockAnswerFromAdminMutation();
  const [deleteQueryAnswerFromAdmin, { isLoading: isLoadingDelete }] = useDeleteAnswerFromAdminMutation();

  useEffect(() => {
    if (isSuccess) {
      setAnswersData(data?.answers || []);
      setTotalAnswers(data?.total || 0);
    }
  }, [data, isSuccess]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch();
  };

  const handleUnblock = async (answerId) => {
    try {
      await unblockQueryAnswerFromAdmin({ answer_Id: answerId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleDelete = async (answerId) => {
    try {
      await deleteQueryAnswerFromAdmin({ answer_Id: answerId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleShowReports = async (answerId) => {
    setSelectedAnswerId(answerId);
    setOpenModal(true);
  };

  const handleCloseReportsModal = () => {
    setOpenModal(false);
    setSelectedAnswerId(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor:'#d4d5d6', marginBottom:'100px' }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" align="left" gutterBottom>
          Blocked Query Answers
        </Typography>
        <Typography variant="body1" align="left" color='green' gutterBottom>
          Here you can see all the answers of queries that are blocked
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
                  style={{ minWidth: column.minWidth , backgroundColor: '#01396C', color: '#ffffff',}}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {answersData.map((answer) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={answer.answer_id} sx={{backgroundColor:'#ffffff',
                '&:nth-of-type(odd)': {
                  backgroundColor: '#D4EAFF',
                },
                '&:last-child td, &:last-child th': {
                  border: 0,
                },
              }}>
                <TableCell>{answer.content}</TableCell>
                <TableCell>{answer.answered_by}</TableCell>
                <TableCell align="center">{new Date(answer.created_at).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <span>{answer.report_count}</span>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleShowReports(answer.answer_id)}
                      style={{ marginLeft: '8px', backgroundColor: 'green' }}
                    >
                      Show Reports
                    </Button>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    
                      
                        <Button
                          onClick={() => handleUnblock(answer.answer_id)}
                          color="primary"
                          variant="contained"
                          sx={{ marginRight: '1rem' }}
                        >
                          Unblock
                        </Button>
                        <Button
                          onClick={() => handleDelete(answer.answer_id)}
                          color="secondary"
                          variant="contained"
                        >
                          {isLoadingDelete ? <CircularProgress size={24} /> : 'Delete'}
                        </Button>

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
        count={totalAnswers}
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
      {selectedAnswerId !== null && (
        
        <ReportsModalForAnswers
          answerId={selectedAnswerId}
          open={openModal}
          onClose={handleCloseReportsModal}
        />
      )}
    </Paper>
  );
};

export default BlockedQueryAnswersTable;
