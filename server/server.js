const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const setupSocketHandlers = require('./socket/socketHandlers');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Create HTTP server using Express app
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Set up Socket.IO event handlers
setupSocketHandlers(io);

// Middleware to attach socket.io to req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.send('Wenlock Hospital Management API is running');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
// User routes are likely handled in auth routes
app.use('/api/patients', require('./routes/patients'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/ot', require('./routes/ot'));
app.use('/api/pharmacy', require('./routes/pharmacy'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Server Error', error: err.message });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
