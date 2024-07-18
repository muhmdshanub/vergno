import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
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
import {  Search, } from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import { useGetAllUsersForAdminQuery, useBlockUserFromAdminMutation, useUnblockUserFromAdminMutation } from '../../slices/api_slices/adminApiSlice';
import ErrorAlertDialog from '../../components/admin/ErrorAlertDialog';



const UserManagement = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [filterOption, setFilterOption] = useState('default');
  const [page, setPage] = useState(0);
  const [usersData, setUsersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [errorGenerated, setErrorGenerated] = useState(false);
  const [errorContent, setErrorContent] = useState('');
  

  const { data, isLoading,isSuccess, isError, refetch } = useGetAllUsersForAdminQuery({
    searchBy: searchQuery,
    sortBy: sortOption,
    filterBy: filterOption,
    page: page + 1, // Adjusting for 1-based index as per API
    limit: 10,
  },
  {
    refetchOnMountOrArgChange: true,
  }

  );

  const [blockUser,{ isLoading : isLoadingBlock},  ] = useBlockUserFromAdminMutation();
  const [unblockUser, { isLoading : isLoadingUnblock}] = useUnblockUserFromAdminMutation();

  useEffect(() => {
    if (data && isSuccess === true) {
      setUsersData(data?.users);
      setTotalUsers(data?.totalCount);
      console.log(data)
    }
  }, [data, isSuccess]);

  useEffect(()=>{
    console.log(usersData)
  },[usersData])

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

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

  const handleSearchClick = () => {
    setPage(0); // Reset to first page
    refetch();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch();
  };

  const handleBlock = async (userId) => {
    try {
      await blockUser({ userId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await unblockUser({ userId });
      setErrorGenerated(false);
      setErrorContent('');
      refetch();
    } catch (error) {
      setErrorGenerated(true);
      setErrorContent(JSON.stringify(error));
    }
  };



  const columns = [
    { id: 'photo', label: 'Photo', width: 100 },
    { id: 'name', label: 'Name', width: 100 },
    { id: 'email', label: 'Email', width: 150 },
    { id: 'joinedDate', label: 'Joined Date', width: 100 },
    { id: 'numQueries', label: 'Num of Queries', width: 80 },
    { id: 'numPerspectives', label: 'Num of Perspectives', width: 80 },
    { id: 'numQueryComments', label: 'Num of Query Comments', width: 80 },
    { id: 'numPerspectiveComments', label: 'Num of Perspective Comments', width: 80 },
    { id: 'numberOfusersBlockedByThisUser', label: 'Number of Users Blocked By This User', width: 180 }, // New field
    { id: 'numberOfUsersBlockedThisUser', label: 'Number of Users Blocked This User', width: 180 }, // New field
    { id: 'actions', label: 'Actions', width: 250 },
  ];

  return (
    <Container>
      <Paper elevation={3} sx={{ paddingTop: 4,paddingBottom:4, marginTop: 4,marginBottom:4, minWidth: '500px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          User Management
        </Typography>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{ backgroundColor: theme.palette.logoColor.main, padding: '30px 20px', color: theme.palette.primary.main }}
        >
          <TextField
            label=""
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              width: '200px',
              padding:'5px'
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={handleSearchClick}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: theme.palette.primary.main, padding: '10px' }}>
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
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="oldest">Old</MenuItem>
                <MenuItem value="latest">Latest</MenuItem>
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
                <MenuItem value="default">All Users</MenuItem>
                <MenuItem value="blocked">Blocked Users</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

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
            <TableContainer component={Paper} sx={{ overflowX: 'auto', maxHeight: 'unset' }}>
              <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#000000' }}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align="center"
                        style={{ width: column.width, fontWeight: 'bold', border: 'none', backgroundColor: '#01396C', color: '#ffffff' }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersData?.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: '#D4EAFF',
                        },
                        '&:last-child td, &:last-child th': {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell align="center">
                        {user.image || user.googleProfilePicture ? (
                          <img
                            src={user?.image?.url || user?.googleProfilePicture}
                            alt={user.name}
                            style={{ width: 50, height: 50, borderRadius: '10%' }}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell align="center">{user.name}</TableCell>
                      <TableCell align="center">{user.email}</TableCell>
                      <TableCell align="center">{user.createdAt}</TableCell>
                      <TableCell align="center">{user.numberOfQueries}</TableCell>
                      <TableCell align="center">{user.numberOfPerspectives}</TableCell>
                      <TableCell align="center">{user.numberOfQueryComments}</TableCell>
                      <TableCell align="center">{user.numberOfPerspectiveComments}</TableCell>
                      <TableCell align="center">{user?.numberOfusersBlockedByThisUser || 0}</TableCell> {/* New field */}
                      <TableCell align="center">{user?.numberOfUsersBlockedThisUser || 0}</TableCell> {/* New field */}
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <Typography variant="body2" component="span" marginRight="1rem">
                              {user.isBlocked ? 'Blocked from App' : 'Not Blocked from App'}
                            </Typography>
                            {!user.isBlocked && (
                              <Button
                                onClick={() => handleBlock(user._id)}
                                color="primary"
                                sx={{ backgroundColor: "red", marginLeft: '1.5rem' }}
                              >
                                Block
                              </Button>
                            )}
                            {user.isBlocked && (
                              <Button
                                onClick={() => handleUnblock(user._id)}
                                color="primary"
                                sx={{ backgroundColor: "green", marginLeft: '1.5rem' }}
                              >
                                Unblock
                              </Button>
                            )}
                          </Box>
                        
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            
              <TablePagination
                component="div"
                rowsPerPageOptions={[10]}
                count={totalUsers || 0}
                rowsPerPage={10}
                page={page}
                onPageChange={handleChangePage}
              />
            
          </>
        )}

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

export default UserManagement;