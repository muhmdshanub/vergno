import React, { useState } from 'react';
import {
  Button,
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  TextField,
} from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';
import SuggestionsTopicsCard from '../components/topics/SuggestionsTopicsCard';
import SuggestionsTopicsCardSkeleton from '../components/skeletons/TopicsCardSkeleton';
import SingleTopicProfileDetailsCard from '../components/topics/SingleTopicProfileDetailsCard';
import InboxConversationCardSkeleton from '../components/skeletons/InboxConversationCardSkeleton';
import { useSelector } from 'react-redux';
import InfiniteScrollComponent from '../components/InfiniteScrollComponent';
import LoadingModal from '../components/LoadingModal';

const UserManagement = () => {

  const {userInfo} = useSelector( state => state.userAuth)
  // Example data (replace with actual user data or fetch from API)
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', joinedDate: '2023-01-01', numQueries: 5, numPerspectives: 3, numQueryComments: 10, numPerspectiveComments: 8, blocked: false },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', joinedDate: '2023-02-15', numQueries: 3, numPerspectives: 2, numQueryComments: 6, numPerspectiveComments: 5, blocked: true },
    // Add more user data as needed
  ]);

  const columns = [
    { id: 'name', label: 'Name', width: 100 },
    { id: 'email', label: 'Email', width: 150 },
    { id: 'joinedDate', label: 'Joined Date', width: 100 },
    { id: 'numQueries', label: 'Num of Queries', width: 80 },
    { id: 'numPerspectives', label: 'Num of Perspectives', width: 80 },
    { id: 'numQueryComments', label: 'Num of Query Comments', width: 80 },
    { id: 'numPerspectiveComments', label: 'Num of Perspective Comments', width: 80 },
    { id: 'actions', label: 'Actions', minWidth: 120 },
  ];

  // Pagination state
  const [page, setPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

 

  const handleBlockToggle = (userId) => {
    // Implement your logic to toggle user block/unblock status here
    console.log(`Toggling block status for user with ID: ${userId}`);
  };


   const [input1, setInput1] = useState("");
   const [input2, setInput2] = useState("");
   const [display, setDisplay] = useState(false)
   const [message, setMessage] = useState('');

  const handleInput1Change = (e) => {
    setInput1(e.target.value)
  }

  const handleInput2Change = (e) => {
    setInput2 (e.target.value)
  }

  const checkInputs = () =>{

    setDisplay(true)

    if(input1 === input2){
      setMessage ("its matching")
    }else{
      setMessage ("its not matching")
    }
  }

  return (
    // <Container>
    //   <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
    //     <Typography variant="h4" align="center" gutterBottom>
    //       User Management
    //     </Typography>

    //     <TableContainer component={Paper} sx={{ overflowX: 'auto', maxHeight: 'unset' }}>
    //       <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 800 }}>
    //         <TableHead >
    //           <TableRow sx={{backgroundColor:"#000000"}}>
    //             {columns.map((column) => (
    //               <TableCell
    //                 key={column.id}
    //                 align="center"
    //                 style={{ width: column.width, fontWeight: 'bold', border: 'none', backgroundColor: "#01396C",color:'#ffffff' }}
    //               >
    //                 {column.label}
    //               </TableCell>
    //             ))}
    //           </TableRow>
    //         </TableHead>
    //         <TableBody>
    //           {users.slice(page * 10, page * 10 + 10).map((user, index) => (
    //             <TableRow key={user.id} sx={{
    //               '&:nth-of-type(odd)': {
    //                 backgroundColor: '#D4EAFF', // Light gray background for odd rows
    //               },
    //               '&:last-child td, &:last-child th': {
    //                 border: 0,
    //               },
    //             }}>
    //               <TableCell align="center">{user.name}</TableCell>
    //               <TableCell align="center">{user.email}</TableCell>
    //               <TableCell align="center">{user.joinedDate}</TableCell>
    //               <TableCell align="center">{user.numQueries}</TableCell>
    //               <TableCell align="center">{user.numPerspectives}</TableCell>
    //               <TableCell align="center">{user.numQueryComments}</TableCell>
    //               <TableCell align="center">{user.numPerspectiveComments}</TableCell>
    //               <TableCell align="center">
    //                 <IconButton onClick={() => handleBlockToggle(user.id)}>
    //                   {user.blocked ? <CheckCircle /> : <Block />}
    //                 </IconButton>
    //               </TableCell>
    //             </TableRow>
    //           ))}
    //         </TableBody>
    //       </Table>
    //     </TableContainer>

    //     <TablePagination
    //       component="div"
    //       rowsPerPageOptions={[10]}
    //       count={users.length}
    //       rowsPerPage={10}
    //       page={page}
    //       onPageChange={handleChangePage}
    //     />
    //   </Paper>
    // </Container>

    

    <div style={{marginTop:'200px', paddingTop:'100px', maxWidth:'80%', margin:'auto'}}>
      {/* <LoadingModal open={true} /> */}
     <SingleTopicProfileDetailsCard />

     <InboxConversationCardSkeleton />

     <h1>{JSON.stringify(userInfo)}</h1>
     <InfiniteScrollComponent />

     <button onClick={() => {console.log(new Date())}}> clcik
     </button>


    </div>
  );
};

export default UserManagement;