import { configureStore } from '@reduxjs/toolkit';
import droneReducer from './slices/droneSlice';
import missionReducer from './slices/missionSlice';

// Add middleware for debugging
const logger = (store: any) => (next: any) => (action: any) => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  return result;
};

export const store = configureStore({
  reducer: {
    drones: droneReducer,
    missions: missionReducer,
    // Add other reducers here as we create them
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 