// const http = require('http');
// const { Server } = require('socket.io');
// const dotenv = require('dotenv');
// const app = require('./app');
// const initializeSocket = require('./configs/socket');
// const connectDB = require('./configs/db');



// // Load environment variables
// dotenv.config();

// // Connect to the database
// connectDB();

// const port = process.env.PORT || 8000;

// // Create HTTP server
// const server = http.createServer(app);

// // Integrate Socket.io
// const io = initializeSocket(server);

// console.log("outside app.use")
// // Attach the io instance to the request object
// app.use((req, res, next) => {
//     console.log("inside app.use")
//     req.io = io; // Access the io instance set in server.js
    
//     console.log("req.io is " , req.io) 
//     next();
// });

// // Test route to verify middleware
// app.get('/test', (req, res) => {
//     if (req.io) {
//         res.status(200).send('Socket.io is attached');
//     } else {
//         res.status(500).send('Socket.io is not attached');
//     }
// });

// // Start server
// server.listen(port, () => {
//     console.log(`Server started and running on http://localhost:${port}`);
// });


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const initializeSocket = require('./configs/socket');
const connectDB = require('./configs/db');
const checkForBirthdays = require('./middlewares/cronJobs')

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const port = process.env.PORT || 8000;

// Initialize express app
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, // Allow credentials (cookies) to be sent
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Create HTTP server
const server = http.createServer(app);

// Integrate Socket.io
const io = initializeSocket(server);



// Attach the io instance to the request object
app.use((req, res, next) => {
    
    req.io = io; // Access the io instance set in server.js
    
    next();
});

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/', (req, res) => {
    res.send("Server is running...");
});



// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(port, () => {
    console.log(`Server started and running on http://localhost:${port}`);
    checkForBirthdays();
});
