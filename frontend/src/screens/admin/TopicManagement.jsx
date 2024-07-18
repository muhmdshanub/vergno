
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem,
  Box, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination
} from '@mui/material';
import { styled } from '@mui/system';
import AddTopicModal from '../../components/admin/topics/AddTopicModal'; // Import the AddTopicModal component
import ErrorAlertDialog from '../../components/admin/ErrorAlertDialog';
import { useGetAllTopicsForAdminQuery } from '../../slices/api_slices/adminApiSlice';

const Root = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  width: '95%',
  margin: 'auto',
  marginTop: theme.spacing(4), // Added margin from the top for the heading
  backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent background
  backdropFilter: 'blur(5px) saturate(200%)', // Blur effect
  WebkitBackdropFilter: 'blur(5px) saturate(200%)', // For Safari
  borderRadius: '10px', // Rounded corners
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const SelectControl = styled(FormControl)(({ theme }) => ({
  marginLeft: 'auto', // Align to the right
  width: '200px', // Optional: set a fixed width for the select
}));

const CreateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  alignSelf: 'center',
  padding: '15px',
  color: '#ffffff',
  backgroundColor: '#0C1844'
}));

const FilledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: '#FF6969',
  color: "#ffffff",
  boxShadow: theme.shadows[2],
}));


const GlassmorphicTableContainer = styled(TableContainer)(({ theme }) => ({
  overflowX: 'auto',
  maxHeight: 'unset',
  minHeight: '600px',
  backgroundColor: 'transparent', // Fully transparent background
  borderRadius: '10px', // Rounded corners
  boxShadow: theme.shadows[4], // Slight shadow for depth
  padding: theme.spacing(2), // Optional: padding inside the table container
}));

const GlassmorphicTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  color: '#000000', // Text color
  
}));




const TopicsManagementScreen = () => {
  const [sortOption, setSortOption] = useState('default');
  const [page, setPage] = useState(0);
  const [topicsData, setTopicsData] = useState([]);
  const [totalTopics, setTotalTopics] = useState(0); 
  const [modalOpen, setModalOpen] = useState(false);
  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');

  const { data, isLoading, isSuccess, isError, error, refetch } = useGetAllTopicsForAdminQuery({
    sortBy: sortOption,
    page: page + 1, // Adjusting for 1-based index as per API
    limit: 10,
  }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (isError === true && error) {
      setErrorGenerated(true);
      setErrorContent(error?.data?.message);
    }
  }, [isError, error]);

  useEffect(() => {
    if (isSuccess) {
      setTopicsData(data?.topics);
      setTotalTopics(data?.totalTopics);
    }
  }, [data, isSuccess]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setPage(0); // Reset to first page
    refetch();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch();
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const columns = [
    { id: 'name', label: 'Topic Name', width: 150 },
    { id: 'description', label: 'Topic Description', width: 400 },
    { id: 'created_at', label: 'Created At', width: 120 },
    { id: 'queriesCount', label: 'Count of Queries', width: 120 },
    { id: 'perspectiveCount', label: 'Count of Perspectives', width: 120 },
    { id: 'followersCount', label: 'Count of Followers', width: 120 },
  ];

  return (
    <Root>
      <Header>
        <Typography variant="h5" sx={{ color: "#000000" }}>Topics Management</Typography>
      </Header>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <CreateButton variant="contained" onClick={handleOpenModal}>
          Create New Topic
        </CreateButton>
      </Box>
      <Controls>
        <SelectControl>
          <InputLabel sx={{ color: "#ffffff" }}>Sort By</InputLabel>
          <FilledSelect
            label="Sort By"
            value={sortOption}
            onChange={handleSortChange}
          >
            <MenuItem value="default">Name</MenuItem>
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </FilledSelect>
        </SelectControl>
      </Controls>
      <Box sx={{ width: '100%', marginTop: '1rem', padding: '2rem', paddingLeft: '2%', paddingRight: '2%' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">
            An error occurred while fetching data.
          </Typography>
        ) : (
          <>
            {/* <GlassmorphicTableContainer component={Paper} sx={{ overflowX: 'auto', maxHeight: 'unset', minHeight: '600px' }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#00FFFF' }}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align="center"
                        style={{
                          width: column.width,
                          fontWeight: 'bold',
                          border: 'none',
                          backgroundColor: '#FB97B8 ',
                          color: '#ffffff',
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topicsData?.map((topic) => (
                    <TableRow
                      key={topic._id}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: '#D1FBE6',
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: '#F9FFD8',
                        },
                        '&:last-child td, &:last-child th': {
                          
                          border: 0,
                        },
                        
                        
                      }}
                    >
                      <TableCell align="center">{topic.name}</TableCell>
                      <TableCell align="center">{topic.description}</TableCell>
                      <TableCell align="center">{new Date(topic.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="center">{topic.queriesCount}</TableCell>
                      <TableCell align="center">{topic.perspectivesCount}</TableCell>
                      <TableCell align="center">{topic.followersCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
              component="div"
              rowsPerPageOptions={[10]}
              count={totalTopics || 0}
              rowsPerPage={10}
              page={page}
              onPageChange={handleChangePage}
              sx={{backgroundColor:'#000000', color:"#ffffff"}}
            />
            </GlassmorphicTableContainer> */}

<GlassmorphicTableContainer component={Paper}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <GlassmorphicTableCell
                        key={column.id}
                        align="center"
                        style={{
                          width: column.width,
                          fontWeight: 'bold',
                        }}
                      >
                        {column.label}
                      </GlassmorphicTableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topicsData?.map((topic) => (
                    <TableRow
                      key={topic._id}
                      sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0,
                        },
                      }}
                    >
                      <GlassmorphicTableCell align="center">{topic.name}</GlassmorphicTableCell>
                      <GlassmorphicTableCell align="left" >{topic.description}</GlassmorphicTableCell>
                      <GlassmorphicTableCell align="center">{new Date(topic.created_at).toLocaleDateString()}</GlassmorphicTableCell>
                      <GlassmorphicTableCell align="center">{topic.queriesCount}</GlassmorphicTableCell>
                      <GlassmorphicTableCell align="center">{topic.perspectivesCount}</GlassmorphicTableCell>
                      <GlassmorphicTableCell align="center">{topic.followersCount}</GlassmorphicTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                rowsPerPageOptions={[10]}
                count={totalTopics || 0}
                rowsPerPage={10}
                page={page}
                onPageChange={handleChangePage}
                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#ffffff' }}
              />
            </GlassmorphicTableContainer>
            
          </>
        )}
      </Box>
      <AddTopicModal open={modalOpen} handleClose={handleCloseModal} />
      <ErrorAlertDialog
        title="Error"
        message={errorContent}
        open={errorGenerated}
        onClose={() => { setErrorGenerated(false); setErrorContent('') }}
      />
    </Root>
  );
};

export default TopicsManagementScreen;
