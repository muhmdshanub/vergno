import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteReportPostFromAdminMutation , useGetPerspectiveFromAdminQuery , useBlockPerspectiveFromAdminMutation, useUnblockPerspectiveFromAdminMutation, useDeletePerspectiveFromAdminMutation, useGetAllReportsForSinglePerspectiveFromAdminQuery} from '../../slices/api_slices/adminApiSlice';
import PerspectivePostCardAdmin from '../../components/admin/perspective/PerspectivePostCardAdmin';
import PerspectivePostCardAdminSkeleton from '../../components/skeletons/PerspectiveCardAdminSkeleton';
import { Paper, Box, Typography , Button, TableContainer,Table,TableBody,TableCell,TableHead,TableRow,TablePagination, CircularProgress,} from '@mui/material';
import ErrorAlertDialog from '../../components/admin/ErrorAlertDialog';
import relativeTime from '../../utils/relativeTime'


const SinglePerspectiveScreen = () => {
  const { perspectiveId } = useParams();
  const navigate = useNavigate()

  const [perspectiveData,setPerspectiveData] = useState(null);
  

  const { data, error, isLoading, refetch } = useGetPerspectiveFromAdminQuery({ perspectiveId });

  

  const [blockPerspective, { isLoading: isLoadingBlock }] = useBlockPerspectiveFromAdminMutation();
  const [unblockPerspective, { isLoading: isLoadingUnblock }] = useUnblockPerspectiveFromAdminMutation();
  const [deletePerspective, { isLoading: isLoadingDelete }] = useDeletePerspectiveFromAdminMutation();
  const [deleteReportPost, {isLoading : isDeleteReportLoading, isSuccess: isDeleteReportSuccess}] = useDeleteReportPostFromAdminMutation();


  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');





  useEffect(() => {
    if (data) {
      setPerspectiveData(data?.perspective);
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
      await blockPerspective({ perspectiveId });
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
      await unblockPerspective({ perspectiveId });
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
      await deletePerspective({ perspectiveId });
      setErrorGenerated(false);
      setErrorContent('');
      navigate('/admin/perspective-management')
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent("Failed to delete");
    }
  };

  //reports table data
  const [page, setPage] = useState(0);

  const {data: reports, error: reportsError, isLoadibg: reportsLoading, isSuccess : isReportsSuccess, refetch: refetch_reports} = useGetAllReportsForSinglePerspectiveFromAdminQuery({
    perspectiveId,
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

            {/* Perspective Status and Actions */}
        {perspectiveData && (
          <Box mt={2} mb={3} sx={{display:'flex', justifyContent:'space-between'}}>
            <Typography variant="subtitle1">
              Status: {perspectiveData.isBlocked ? 'Blocked' : 'Not Blocked'}
            </Typography>
            {perspectiveData.isBlocked ? (
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
                {isLoading && <PerspectivePostCardAdminSkeleton />}
                {error && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <Typography variant="h6" color="error">
                        Error: {error.message}
                    </Typography>
                    </Box>
                )}
                {perspectiveData && 
                
                    <PerspectivePostCardAdmin key={perspectiveData._id} post={{perspectiveData}} />
                
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

export default SinglePerspectiveScreen;
