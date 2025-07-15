import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API
const API_URL = 'http://localhost:5000/api/pharmacy/drugs/';

// Get all drugs
export const getAllDrugs = createAsyncThunk(
  'pharmacy/getAllDrugs',
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

// Get drug by ID
export const getDrugById = createAsyncThunk(
  'pharmacy/getDrugById',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.get(API_URL + id, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Add new drug
export const addDrug = createAsyncThunk(
  'pharmacy/addDrug',
  async (drugData, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.post(API_URL, drugData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Update drug
export const updateDrug = createAsyncThunk(
  'pharmacy/updateDrug',
  async ({ id, drugData }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id, drugData, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Update drug stock
export const updateDrugStock = createAsyncThunk(
  'pharmacy/updateDrugStock',
  async ({ id, quantity, operation }, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.put(API_URL + id + '/stock', { quantity, operation }, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Delete drug
export const deleteDrug = createAsyncThunk(
  'pharmacy/deleteDrug',
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

// Search drugs
export const searchDrugs = createAsyncThunk(
  'pharmacy/searchDrugs',
  async (query, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.get(`${API_URL}search?query=${query}`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Get low stock drugs
export const getLowStockDrugs = createAsyncThunk(
  'pharmacy/getLowStockDrugs',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get user token
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      
      const response = await axios.get(API_URL + 'lowstock', config);
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
  drugs: [],
  selectedDrug: null,
  lowStockDrugs: [],
  searchResults: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Pharmacy slice
const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSelectedDrug: (state) => {
      state.selectedDrug = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all drugs cases
      .addCase(getAllDrugs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllDrugs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drugs = action.payload;
      })
      .addCase(getAllDrugs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get drug by ID cases
      .addCase(getDrugById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDrugById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedDrug = action.payload;
      })
      .addCase(getDrugById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add drug cases
      .addCase(addDrug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addDrug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drugs.push(action.payload);
      })
      .addCase(addDrug.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update drug cases
      .addCase(updateDrug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDrug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drugs = state.drugs.map(
          (drug) => drug._id === action.payload._id ? action.payload : drug
        );
        state.selectedDrug = action.payload;
      })
      .addCase(updateDrug.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update drug stock cases
      .addCase(updateDrugStock.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateDrugStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drugs = state.drugs.map(
          (drug) => drug._id === action.payload.drug._id ? action.payload.drug : drug
        );
        state.selectedDrug = action.payload.drug;
      })
      .addCase(updateDrugStock.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete drug cases
      .addCase(deleteDrug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDrug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.drugs = state.drugs.filter((drug) => drug._id !== action.payload);
      })
      .addCase(deleteDrug.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Search drugs cases
      .addCase(searchDrugs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchDrugs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.searchResults = action.payload;
      })
      .addCase(searchDrugs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get low stock drugs cases
      .addCase(getLowStockDrugs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLowStockDrugs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lowStockDrugs = action.payload;
      })
      .addCase(getLowStockDrugs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearSelectedDrug, clearSearchResults } = pharmacySlice.actions;
export default pharmacySlice.reducer;
