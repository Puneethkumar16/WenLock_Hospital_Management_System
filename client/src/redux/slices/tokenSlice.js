import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API
const API_URL = 'http://localhost:5000/api/tokens/';

// Get all tokens
export const getAllTokens = createAsyncThunk(
  'tokens/getAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Get department tokens
export const getDepartmentTokens = createAsyncThunk(
  'tokens/getByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL + `department/${departmentId}`);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Get token by ID
export const getTokenById = createAsyncThunk(
  'tokens/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL + id);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Generate new token
export const generateToken = createAsyncThunk(
  'tokens/generate',
  async (tokenData, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.post(API_URL, tokenData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Update token status
export const updateTokenStatus = createAsyncThunk(
  'tokens/updateStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id, { status }, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Get current department token
export const getCurrentDepartmentToken = createAsyncThunk(
  'tokens/getCurrentByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL + `department/${departmentId}/current`);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  tokens: [],
  departmentTokens: [],
  currentToken: null,
  selectedToken: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Token slice
const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSelectedToken: (state) => {
      state.selectedToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all tokens cases
      .addCase(getAllTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tokens = action.payload;
      })
      .addCase(getAllTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get department tokens cases
      .addCase(getDepartmentTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartmentTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departmentTokens = action.payload;
      })
      .addCase(getDepartmentTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get token by ID cases
      .addCase(getTokenById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTokenById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedToken = action.payload;
      })
      .addCase(getTokenById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Generate token cases
      .addCase(generateToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tokens.push(action.payload.token);
        state.departmentTokens.push(action.payload.token);
        state.selectedToken = action.payload;
      })
      .addCase(generateToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update token status cases
      .addCase(updateTokenStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTokenStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tokens = state.tokens.map(
          (token) => token._id === action.payload._id ? action.payload : token
        );
        state.departmentTokens = state.departmentTokens.map(
          (token) => token._id === action.payload._id ? action.payload : token
        );
        if (state.selectedToken && state.selectedToken._id === action.payload._id) {
          state.selectedToken = action.payload;
        }
      })
      .addCase(updateTokenStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get current department token cases
      .addCase(getCurrentDepartmentToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentDepartmentToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentToken = action.payload;
      })
      .addCase(getCurrentDepartmentToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearSelectedToken } = tokenSlice.actions;
export default tokenSlice.reducer;
