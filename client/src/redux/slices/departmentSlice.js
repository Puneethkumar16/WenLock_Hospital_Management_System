import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API
const API_URL = 'http://localhost:5000/api/departments/';

// Get all departments
export const getDepartments = createAsyncThunk(
  'departments/getAll',
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

// Get department by ID
export const getDepartmentById = createAsyncThunk(
  'departments/getById',
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

// Create new department
export const createDepartment = createAsyncThunk(
  'departments/create',
  async (departmentData, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.post(API_URL, departmentData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Update department
export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, departmentData }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id, departmentData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Delete department
export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      await axios.delete(API_URL + id, config);
      return id;
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
  departments: [],
  currentDepartment: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Department slice
const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all departments cases
      .addCase(getDepartments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments = action.payload;
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get department by ID cases
      .addCase(getDepartmentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentDepartment = action.payload;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create department cases
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update department cases
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments = state.departments.map(
          (dept) => dept._id === action.payload._id ? action.payload : dept
        );
        state.currentDepartment = action.payload;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete department cases
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.departments = state.departments.filter(
          (dept) => dept._id !== action.payload
        );
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
