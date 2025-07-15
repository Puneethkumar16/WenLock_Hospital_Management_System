import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { reset as tokenReset } from '../redux/slices/tokenSlice';
import { reset as otReset } from '../redux/slices/otSlice';
import { reset as pharmacyReset } from '../redux/slices/pharmacySlice';
import { reset as departmentReset } from '../redux/slices/departmentSlice';

// Determine the API URL from environment or default to localhost
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  // Create new socket connection with auth token
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });
  // Token events
  socket.on('token:new', () => {
    // Refresh tokens on new token creation
    store.dispatch(tokenReset());
  });

  socket.on('token:update', () => {
    // Refresh tokens on token update
    store.dispatch(tokenReset());
  });

  socket.on('token:delete', () => {
    // Refresh tokens on token deletion
    store.dispatch(tokenReset());
  });
  // OT Schedule events
  socket.on('ot:new', () => {
    // Refresh OT schedules on new schedule
    store.dispatch(otReset());
  });

  socket.on('ot:update', () => {
    // Refresh OT schedules on schedule update
    store.dispatch(otReset());
  });

  socket.on('ot:delete', () => {
    // Refresh OT schedules on schedule deletion
    store.dispatch(otReset());
  });
  // Drug inventory events
  socket.on('drug:new', () => {
    // Refresh drug inventory on new drug
    store.dispatch(pharmacyReset());
  });

  socket.on('drug:update', () => {
    // Refresh drug inventory on drug update
    store.dispatch(pharmacyReset());
  });

  socket.on('drug:delete', () => {
    // Refresh drug inventory on drug deletion
    store.dispatch(pharmacyReset());
  });  // Department events
  socket.on('department:update', () => {
    // Refresh departments when there's an update
    store.dispatch(departmentReset());
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Create a named export object to avoid ESLint warning
const socketService = {
  initSocket,
  getSocket,
  disconnectSocket,
};

export default socketService;
