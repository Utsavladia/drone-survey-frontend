import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Drone } from '../../types';
import { droneApi } from '../../services/api';

interface DroneState {
  drones: Drone[];
  selectedDrone: Drone | null;
  loading: boolean;
  error: string | null;
}

const initialState: DroneState = {
  drones: [],
  selectedDrone: null,
  loading: false,
  error: null,
};

export const fetchDrones = createAsyncThunk(
  'drones/fetchAll',
  async () => {
    const response = await droneApi.getAll();
    return response.data;
  }
);

export const fetchDroneById = createAsyncThunk(
  'drones/fetchById',
  async (id: string) => {
    const response = await droneApi.getById(id);
    return response.data;
  }
);

const droneSlice = createSlice({
  name: 'drones',
  initialState,
  reducers: {
    clearSelectedDrone: (state) => {
      state.selectedDrone = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrones.fulfilled, (state, action) => {
        state.loading = false;
        state.drones = action.payload;
      })
      .addCase(fetchDrones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch drones';
      })
      .addCase(fetchDroneById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDroneById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDrone = action.payload;
      })
      .addCase(fetchDroneById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch drone';
      });
  },
});

export const { clearSelectedDrone } = droneSlice.actions;
export default droneSlice.reducer; 