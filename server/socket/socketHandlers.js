const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.io event handlers
const setupSocketHandlers = (io) => {
  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });
  
  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.user.name}`);
    
    // Join role-based rooms for targeted events
    socket.join(`role:${socket.user.role}`);
    
    // If user has a department, join department room
    if (socket.user.department) {
      socket.join(`department:${socket.user.department}`);
    }
    
    // Generic room for all authenticated users
    socket.join('authenticated');
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
    
    // Token queue updates
    socket.on('token:update', (data) => {
      // Validate user permissions here if needed
      // Broadcast to department room
      io.to(`department:${data.departmentId}`).emit('token:update', data);
    });
    
    // Emergency alert
    socket.on('emergency:alert', (data) => {
      // Broadcast to all users
      io.emit('emergency:alert', {
        department: data.department,
        message: data.message,
        timestamp: new Date()
      });
    });
    
    // Department-specific message
    socket.on('department:message', (data) => {
      io.to(`department:${data.departmentId}`).emit('department:message', {
        sender: socket.user.name,
        message: data.message,
        timestamp: new Date()
      });
    });
    
    // OT status update
    socket.on('ot:status', (data) => {
      // Broadcast to relevant roles (doctors, nurses, admin)
      io.to('role:doctor').to('role:nurse').to('role:admin').emit('ot:status', data);
    });
    
    // Low stock alert
    socket.on('pharmacy:lowstock', (data) => {
      // Broadcast to pharmacists and admins
      io.to('role:pharmacist').to('role:admin').emit('pharmacy:lowstock', data);
    });
  });
};

module.exports = setupSocketHandlers;
