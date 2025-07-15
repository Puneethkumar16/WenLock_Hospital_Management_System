import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import socketService from '../services/socketService';

// Base URL for API
const API_URL = 'http://localhost:5000/api/auth/';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user')) || null;

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Registering user with:', JSON.stringify(userData));
      const response = await axios.post(API_URL + 'register', userData, {
        timeout: 10000,  // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Registration response:', response.data);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Logging in user with:', JSON.stringify(userData));
      const response = await axios.post(API_URL + 'login', userData, {
        timeout: 10000,  // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login response:', response.data);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        // Initialize socket connection with token
        socketService.initSocket(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  // Remove user from localStorage
  localStorage.removeItem('user');
  // Disconnect socket
  socketService.disconnectSocket();
});

// Initial state
const initialState = {
  user: user ? user : null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
