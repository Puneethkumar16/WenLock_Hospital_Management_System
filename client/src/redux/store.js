import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import departmentReducer from './slices/departmentSlice';
import tokenReducer from './slices/tokenSlice';
import otReducer from './slices/otSlice';
import pharmacyReducer from './slices/pharmacySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    tokens: tokenReducer,
    ot: otReducer,
    pharmacy: pharmacyReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;
