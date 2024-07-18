import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@emotion/react';
import { useGetAllReportsForAllPerspectivesFromAdminQuery, useGetAllPerspectivesForAdminQuery, useBlockPerspectiveFromAdminMutation, useUnblockPerspectiveFromAdminMutation, useDeletePerspectiveFromAdminMutation } from '../../slices/api_slices/adminApiSlice';
import ErrorAlertDialog from '../../components/admin/ErrorAlertDialog';
import { useNavigate } from 'react-router-dom';
import relativeTime from '../../utils/relativeTime';

const PerspectiveManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate()
  const [sortOption, setSortOption] = useState('latest');
  const [filterOption, setFilterOption] = useState('default');
  const [page, setPage] = useState(0);
  const [reportPage, setReportPage] = useState(0);
  const [perspectivesData, setPerspectivesData] = useState([]);
  const [totalPerspectives, setTotalPerspectives] = useState(0);
  const [reportsData, setReportsData] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');

  const { data, isLoading, isSuccess, isError, refetch } = useGetAllPerspectivesForAdminQuery({
    sortBy: sortOption,
    filterBy: filterOption,
    page: page + 1, // Adjusting for 1-based index as per API
    limit: 10,
  },{refetchOnMountOrArgChange: true, });


  const { data: reportsDataRes, isLoading: isLoadingReports, isSuccess: isSuccessReports, isError: isErrorReports, refetch: refetchReports } = useGetAllReportsForAllPerspectivesFromAdminQuery({
    page: reportPage + 1, // Adjusting for 1-based index as per API
    limit: 10,
  }, { refetchOnMountOrArgChange: true });


  const [blockPerspective, { isLoading: isLoadingBlock }] = useBlockPerspectiveFromAdminMutation();
  const [unblockPerspective, { isLoading: isLoadingUnblock }] = useUnblockPerspectiveFromAdminMutation();
  const [deletePerspective, { isLoading: isLoadingDelete }] = useDeletePerspectiveFromAdminMutation();

  useEffect(() => {
    if (isSuccess) {
      setPerspectivesData(data?.perspectives);
      setTotalPerspectives(data?.totalCount);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (isSuccessReports) {
      setReportsData(reportsDataRes?.reports);
      setTotalReports(reportsDataRes?.totalCount);
      console.log(reportsDataRes.reports)
    }
  }, [reportsDataRes, isSuccessReports]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setPage(0); // Reset to first page
    refetch();
  };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
    setPage(0); // Reset to first page
    refetch();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch();
  };

  const handleReportChangePage = (event, newPage) => {
    setReportPage(newPage);
    refetchReports();
  };

  const handleBlock = async (perspectiveId) => {
    try {
      await blockPerspective({ perspectiveId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleUnblock = async (perspectiveId) => {
    try {
      await unblockPerspective({ perspectiveId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleDelete = async (perspectiveId) => {
    try {
      await deletePerspective({ perspectiveId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };


  const handleDetailClick = (perspectiveId) => {
    navigate(`/admin/perspective-management/${perspectiveId}`);
  };


  const columns = [
    { id: 'title', label: 'Perspective Title', width: 150 },
    { id: 'content', label: 'Perspective Content', width: 400 },
    { id: 'image', label: 'Perspective Image', width: 150 },
    { id: 'posted_at', label: 'Posted At', width: 120 },
    { id: 'commentCount', label: 'Count of Comments', width: 120 },
    { id: 'answerCount', label: 'Count of Answers', width: 120 },
    { id: 'likeCount', label: 'Count of Likes', width: 120 },
    { id: 'reportCount', label: 'Count of Reports', width: 300 },
    { id: 'status', label: 'Status', width: 180 },
    { id: 'actions', label: 'Actions', width: 300 },
  ];


  const reportColumns = [
    { id: 'reporter_name', label: 'Reporter Name', width: 200 },
    { id: 'reason', label: 'Reason', width: 400 },
    { id: 'posted_at', label: 'Reported Time', width: 400 },
    { id: 'actions', label: 'Actions', width: 300 },
  ];

  return (
    <Container>
      <Paper elevation={3} sx={{ paddingTop: 4, paddingBottom: 4, marginTop: 4, marginBottom: 4, minWidth: '500px' }}>
        <Typography variant="h4" align="center" gutterBottom>
        Perspective Management
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{
            backgroundColor: theme.palette.logoColor.main,
            padding: '30px 20px',
            color: theme.palette.primary.main,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: theme.palette.primary.main,
              padding: '10px',
            }}
          >
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, marginRight: '1rem' }}>
              <InputLabel htmlFor="sort-select">Sort Options</InputLabel>
              <Select
                value={sortOption}
                onChange={handleSortChange}
                label="Sort Options"
                inputProps={{
                  name: 'sortOption',
                  id: 'sort-select',
                }}
              >
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel htmlFor="filter-select">Filter Options</InputLabel>
              <Select
                value={filterOption}
                onChange={handleFilterChange}
                label="Filter Options"
                inputProps={{
                  name: 'filterOption',
                  id: 'filter-select',
                }}
              >
                <MenuItem value="default">All Perspectives</MenuItem>
                <MenuItem value="blocked">Blocked Perspectives</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{width:'100%', marginTop:'1rem', padding:'2rem', paddingLeft:'2%', paddingRight:'2%'}}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" >
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">
            An error occurred while fetching data.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ overflowX: 'auto', maxHeight: 'unset', minHeight:'600px',backgroundColor:"#ebf1f7"}}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 800 }}>
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
                  {perspectivesData?.map((perspective) => (
                    <TableRow
                      key={perspective._id}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: '#D4EAFF',
                        },
                        '&:last-child td, &:last-child th': {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell align="center">{perspective.title}</TableCell>
                      <TableCell align="center">{perspective.description}</TableCell>
                      <TableCell align="center">
                        {perspective.image && (
                          <img src={perspective.image.url} alt={perspective.title} style={{ width: 50, height: 50, borderRadius: '10%' }} />
                        )}
                      </TableCell>
                      <TableCell align="center">{perspective.posted_at}</TableCell>
                      <TableCell align="center">{perspective.totalComments}</TableCell>
                      <TableCell align="center">{perspective.answerCount || 0}</TableCell>
                      <TableCell align="center">{perspective.likeCount}</TableCell>
                      <TableCell align="center">
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <span>{perspective.totalReports}</span>
                                <Button variant="outlined" size="small" backgroundColor="success" onClick={ ()=> handleDetailClick(perspective._id)} style={{ marginLeft: '8px' , backgroundColor:"green"}}>
                                    Show in Detail
                                </Button>
                            </Box>
                       </TableCell>
                      <TableCell align="center">{perspective.isBlocked ? "BLOCKED" : "NOT BLOCKED"}</TableCell>
                      <TableCell align="center">
                        {perspective.isBlocked ? (
                          <Box sx={{display:"flex"}}>
                            <Button onClick={() => handleUnblock(perspective._id)} color="primary" variant="contained" marginRight="10px">
                              Unblock
                            </Button>
                            <Button onClick={() => handleDelete(perspective._id)} color="secondary" variant="contained" sx={{ marginLeft: '1rem' }}>
                              Delete
                            </Button>
                          </Box>
                        ) : (
                          <Button onClick={() => handleBlock(perspective._id)} color="primary" variant="contained">
                            Block
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              rowsPerPageOptions={[10]}
              count={totalPerspectives || 0}
              rowsPerPage={10}
              page={page}
              onPageChange={handleChangePage}
              sx={{backgroundColor:"#ebf1f7"}}
            />
          </>
        )}
        </Box>
        

        <Box sx={{width:'100%', marginTop:'5rem', padding:'2rem', paddingLeft:'10%', paddingRight:'10%'}}>
            <Typography variant="h4" align="center" gutterBottom sx={{ marginTop: 4 }}>
            Perspective Reports Management
            </Typography>

            {isLoadingReports ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : isErrorReports ? (
              <Typography color="error" align="center">
                An error occurred while fetching reports.
              </Typography>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ overflowX: 'auto', maxHeight: 'unset', marginTop: 4 ,  minHeight:'600px', backgroundColor:"#ebf1f7"}}>
                  <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#000000' }}>
                        {reportColumns.map((column) => (
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
                      {reportsData?.map((report) => (

                        

                        <TableRow
                          key={report._id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: '#D4EAFF',
                            },
                            '&:last-child td, &:last-child th': {
                              border: 0,
                            },
                          }}
                        >
                          <TableCell align="center">{report.reporter_name}</TableCell>
                          <TableCell align="center">{report.reason}</TableCell>
                          <TableCell align="center">{relativeTime(report.created_at)}</TableCell>
                          <TableCell align="center">
                            <Button variant="outlined" size="small" onClick={() => handleDetailClick(report.post_id)} sx={{backgroundColor:'green'}}>
                              Show Perspective
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  rowsPerPageOptions={[10]}
                  count={totalReports || 0}
                  rowsPerPage={10}
                  page={reportPage}
                  onPageChange={handleReportChangePage}
                  sx={{backgroundColor:"#ebf1f7"}}
                />
              </>
            )}
        </Box>

        <ErrorAlertDialog
          title="Error"
          message={errorContent}
          open={errorGenerated}
          onClose={() => setErrorGenerated(false)}
        />
      </Paper>
    </Container>
  );
};

export default PerspectiveManagement;
