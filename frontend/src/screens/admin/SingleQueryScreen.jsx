import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteReportPostFromAdminMutation , useGetQueryFromAdminQuery , useBlockQueryFromAdminMutation, useUnblockQueryFromAdminMutation, useDeleteQueryFromAdminMutation, useGetAllReportsForSingleQueryFromAdminQuery} from '../../slices/api_slices/adminApiSlice';
import QueryPostCardAdmin from '../../components/admin/query/QueryPostCardAdmin';
import QueryPostCardAdminSkeleton from '../../components/skeletons/QueryCardAdminSkeleton';
import { Paper, Box, Typography , Button, TableContainer,Table,TableBody,TableCell,TableHead,TableRow,TablePagination, CircularProgress,} from '@mui/material';
import ErrorAlertDialog from '../../components/admin/ErrorAlertDialog';
import relativeTime from '../../utils/relativeTime'


const SingleQueryScreen = () => {
  const { queryId } = useParams();
  const navigate = useNavigate()

  const [queryData, setQueryData] = useState(null);
  

  const { data, error, isLoading, refetch } = useGetQueryFromAdminQuery({ queryId });

  

  const [blockQuery, { isLoading: isLoadingBlock }] = useBlockQueryFromAdminMutation();
  const [unblockQuery, { isLoading: isLoadingUnblock }] = useUnblockQueryFromAdminMutation();
  const [deleteQuery, { isLoading: isLoadingDelete }] = useDeleteQueryFromAdminMutation();
  const [deleteReportPost, {isLoading : isDeleteReportLoading, isSuccess: isDeleteReportSuccess}] = useDeleteReportPostFromAdminMutation();


  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');





  useEffect(() => {
    if (data) {
      setQueryData(data?.query);
    }
    
  }, [data]);

  useEffect(() => {
    if (error) {
      setErrorContent(error.message);
      setErrorGenerated(true);
    }
  }, [error]);

  

  const handleBlock = async () => {
    try {
      await blockQuery({ queryId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent("failed to block");
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockQuery({ queryId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent("Failed to unblock");
    }
  };



  const handleDelete = async () => {
    try {
      await deleteQuery({ queryId });
      setErrorGenerated(false);
      setErrorContent('');
      navigate('/admin/query-management')
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent("Failed to delete");
    }
  };

  //reports table data
  const [page, setPage] = useState(0);

  const {data: reports, error: reportsError, isLoadibg: reportsLoading, isSuccess : isReportsSuccess, refetch: refetch_reports} = useGetAllReportsForSingleQueryFromAdminQuery({
    queryId,
    page: (page + 1) || 1, // Adjusting for 1-based index as per API
    limit: 10,
  },{refetchOnMountOrArgChange: true, })

  
  const [reportsData, setReportsData] = useState([]);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(()=>{
    if(isDeleteReportSuccess){
      refetch_reports();
      console.log("activated")
    }
  },[isDeleteReportSuccess])

  useEffect(() => {
    if (isReportsSuccess) {
      
      setReportsData(reports?.reports);
      setTotalReports(reports?.totalCount);
    }
  }, [reportsData, isReportsSuccess, refetch_reports]);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch_reports();
  };

  const deleteReportHandler = async (reportId) => {
    try{

      const result = await deleteReportPost({reportId});

      if(result.success === true){
        refetch_reports({ page: page + 1 });
      }

    }catch(error){
      setErrorGenerated(true);
      setErrorContent("Failed to remove the report");
    }
    
  };

  
  const columns = [
    { id: 'reporter_name', label: 'Reporter Name', width: 150 },
    { id: 'reason', label: 'Reason', width: 150 },
    { id: 'reported_at', label: 'Reported At', width: 120 },
    { id: 'actions', label: 'Actions', width: 300 },
];





  return (
    <Box padding={3} display="flex" flexDirection='column' justifyContent="center" alignItems="center" minHeight="100vh" >
        <Box sx={{
          minWidth: "450px",
          maxWidth: "700px",
          width: "100%", // Ensures the box takes full width on all screen sizes
          px: { xs: 2, sm: 4 }, // Horizontal padding based on breakpoints
          py: 2, // Vertical padding
          mx: "auto", // Center horizontally
        }}>

            {/* Query Status and Actions */}
        {queryData && (
          <Box mt={2} mb={3} sx={{display:'flex', justifyContent:'space-between'}}>
            <Typography variant="subtitle1">
              Status: {queryData.isBlocked ? 'Blocked' : 'Not Blocked'}
            </Typography>
            {queryData.isBlocked ? (
              <Box mt={1}>
                <Button variant="contained" color="primary" onClick={handleUnblock}>
                  Unblock
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} style={{ marginLeft: 10 }}>
                  Delete
                </Button>
              </Box>
            ) : (
              <Button variant="contained" color="error" onClick={handleBlock} mt={1}>
                Block
              </Button>
            )}
          </Box>
        )}
                {isLoading && <QueryPostCardAdminSkeleton />}
                {error && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <Typography variant="h6" color="error">
                        Error: {error.message}
                    </Typography>
                    </Box>
                )}
                {queryData && 
                
                    <QueryPostCardAdmin key={queryData._id} post={{queryData}} />
                
                }
        </Box>
      
      
      {/* You can add other elements here */}
      {/* Displaying Reports Table */}
      {isReportsSuccess ? (
          <TableContainer component={Paper} sx={{ marginTop: 3 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#000000' }}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align="center"
                      style={{
                        width: column.width,
                        fontWeight: 'bold',
                        border: 'none',
                        backgroundColor: '#01396C',
                        color: '#ffffff',
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.reports?.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell align="center">{report.reporter_name}</TableCell>
                    <TableCell align="center">{report.reason}</TableCell>
                    <TableCell align="center">{relativeTime(report.created_at)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => deleteReportHandler(report._id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
                component="div"
                rowsPerPageOptions={[10]}
                count={totalReports || 0}
                rowsPerPage={10}
                page={page}
                onPageChange={handleChangePage}
              />
          </TableContainer>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            {reportsLoading ? <CircularProgress /> : <Typography color="error">Failed to fetch reports.</Typography>}
          </Box>
        )}





      <ErrorAlertDialog
        title="Error"
        message={errorContent}
        open={errorGenerated}
        onClose={() => setErrorGenerated(false)}
      />
    </Box>
  );
};

export default SingleQueryScreen;
