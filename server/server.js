const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketio(server, {
  cors: {
    origin: '*', // In development, allow all origins. Can be restricted to client URL in prod.
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('The Lost Threads of Bharat API is running.');
});

// Hook up Socket.IO handlers
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
