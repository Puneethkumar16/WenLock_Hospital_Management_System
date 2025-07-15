import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API
const API_URL = 'http://localhost:5000/api/ot/';

// Get all Operation Theatres
export const getAllOTs = createAsyncThunk(
  'ot/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Get OT by ID
export const getOTById = createAsyncThunk(
  'ot/getById',
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

// Create new OT
export const createOT = createAsyncThunk(
  'ot/create',
  async (otData, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.post(API_URL, otData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Update OT status
export const updateOTStatus = createAsyncThunk(
  'ot/updateStatus',
  async ({ id, status, emergencyLevel }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/status', { status, emergencyLevel }, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Schedule OT
export const scheduleOT = createAsyncThunk(
  'ot/schedule',
  async ({ id, scheduleData }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/schedule', scheduleData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Cancel OT Schedule
export const cancelOTSchedule = createAsyncThunk(
  'ot/cancel',
  async ({ id, notes }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/cancel', { notes }, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Start OT Procedure
export const startOTProcedure = createAsyncThunk(
  'ot/start',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/start', {}, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// End OT Procedure
export const endOTProcedure = createAsyncThunk(
  'ot/end',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/end', {}, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Set Emergency for OT
export const setEmergency = createAsyncThunk(
  'ot/emergency',
  async ({ id, emergencyLevel, notes }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/emergency', { emergencyLevel, notes }, config);
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
  operationTheatres: [],
  currentOT: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// OT slice
const otSlice = createSlice({
  name: 'ot',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentOT: (state) => {
      state.currentOT = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all OTs cases
      .addCase(getAllOTs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOTs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = action.payload;
      })
      .addCase(getAllOTs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get OT by ID cases
      .addCase(getOTById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOTById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentOT = action.payload;
      })
      .addCase(getOTById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create OT cases
      .addCase(createOT.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOT.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres.push(action.payload);
      })
      .addCase(createOT.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update OT status cases
      .addCase(updateOTStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOTStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = state.operationTheatres.map(
          (ot) => ot._id === action.payload._id ? action.payload : ot
        );
        if (state.currentOT && state.currentOT._id === action.payload._id) {
          state.currentOT = action.payload;
        }
      })
      .addCase(updateOTStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Schedule OT cases
      .addCase(scheduleOT.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(scheduleOT.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = state.operationTheatres.map(
          (ot) => ot._id === action.payload._id ? action.payload : ot
        );
        if (state.currentOT && state.currentOT._id === action.payload._id) {
          state.currentOT = action.payload;
        }
      })
      .addCase(scheduleOT.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Cancel OT Schedule cases
      .addCase(cancelOTSchedule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOTSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = state.operationTheatres.map(
          (ot) => ot._id === action.payload._id ? action.payload : ot
        );
        if (state.currentOT && state.currentOT._id === action.payload._id) {
          state.currentOT = action.payload;
        }
      })
      .addCase(cancelOTSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Start OT Procedure cases
      .addCase(startOTProcedure.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startOTProcedure.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = state.operationTheatres.map(
          (ot) => ot._id === action.payload._id ? action.payload : ot
        );
        if (state.currentOT && state.currentOT._id === action.payload._id) {
          state.currentOT = action.payload;
        }
      })
      .addCase(startOTProcedure.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // End OT Procedure cases
      .addCase(endOTProcedure.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(endOTProcedure.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = state.operationTheatres.map(
          (ot) => ot._id === action.payload._id ? action.payload : ot
        );
        if (state.currentOT && state.currentOT._id === action.payload._id) {
          state.currentOT = action.payload;
        }
      })
      .addCase(endOTProcedure.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Set Emergency for OT cases
      .addCase(setEmergency.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setEmergency.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.operationTheatres = state.operationTheatres.map(
          (ot) => ot._id === action.payload._id ? action.payload : ot
        );
        if (state.currentOT && state.currentOT._id === action.payload._id) {
          state.currentOT = action.payload;
        }
      })
      .addCase(setEmergency.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentOT } = otSlice.actions;
export default otSlice.reducer;
