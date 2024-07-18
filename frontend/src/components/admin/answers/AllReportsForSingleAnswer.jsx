import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { useGetAllReportsForSingleAnswerFromAdminQuery, useDeleteReportOnAnswerFromAdminMutation } from '../../../slices/api_slices/adminApiSlice'; // Adjust path as per your API setup
import relativeTime from '../../../utils/relativeTime';

const ReportsModalForAnswers = ({ answerId, open, onClose }) => {
    console.log(answerId)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isError, isSuccess, refetch } = useGetAllReportsForSingleAnswerFromAdminQuery({
    pageNum: page + 1, // API pagination starts from 1
    limitNum: rowsPerPage,
    answerId: answerId,
  });

  const [deleteReport] = useDeleteReportOnAnswerFromAdminMutation();

  useEffect(() => {
    refetch();
  }, [page, rowsPerPage, answerId, refetch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await deleteReport({ reportAnswerId: reportId });
      refetch();
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const columns = [
    { id: 'reporterName', label: 'Reporter Name', minWidth: 150 },
    { id: 'reportedAt', label: 'Reported At', minWidth: 150 },
    { id: 'reportReason', label: 'Report Reason', minWidth: 150 },
    { id: 'actions', label: 'Actions', minWidth: '100%' },
  ];


  console.log(data?.reports)

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxHeight: '80%',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography variant="h5" mb={2}>Reports for Answer</Typography>
        
        {isLoading && <CircularProgress />}
        {isError && <Typography color="error">Failed to fetch reports</Typography>}

        {isSuccess && (
          <Paper>
            <TableContainer sx={{backgroundColor:"#ebf1f7"}}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} align="center" style={{ minWidth: column.minWidth, backgroundColor: '#01396C',
                        color: '#ffffff', }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.reports.map((report) => (
                    <TableRow key={report.reportCommentId}>
                      <TableCell align="center">{report.reporter_name}</TableCell>
                      <TableCell align="center">{relativeTime(report.reported_at).toLocaleString()}</TableCell>
                      <TableCell align="center">{report.reason}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleDeleteReport(report.reportAnswerId)} color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10]}
              component="div"
              count={data?.totalCount || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
        
        <Button variant="contained" color="primary" onClick={onClose} mt={2}>Close</Button>
      </Box>
    </Modal>
  );
};


ReportsModalForAnswers.propTypes = {
  answerId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default ReportsModalForAnswers;
