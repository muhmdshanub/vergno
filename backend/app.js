const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const path = require('path');



const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, // Allow credentials (cookies) to be sent
  };
  
app.use(cors(corsOptions));

require('events').EventEmitter.defaultMaxListeners = 15;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes

app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);



app.get('/', (req, res) => {
    res.send("Server is running...");
});

app.get('/test', (req, res) => {
  if (req.io) {
      res.status(200).send('Socket.io is attached');
  } else {
      res.status(500).send('Socket.io is not attached');
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports= app;
