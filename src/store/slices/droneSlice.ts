import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Drone } from '../../types';
import { droneService } from '../../services/droneService';

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
  'drones/fetchDrones',
  async () => {
    const response = await droneService.getDrones();
    return response.data;
  }
);

export const fetchDroneById = createAsyncThunk(
  'drones/fetchById',
  async (id: string) => {
    const response = await droneService.getDroneById(id);
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
    updateDrone: (state, action: PayloadAction<Drone>) => {
      const index = state.drones.findIndex(drone => drone._id === action.payload._id);
      if (index !== -1) {
        state.drones[index] = action.payload;
      }
    },
    updateDroneStatus: (state, action: PayloadAction<{ droneId: string; status: string }>) => {
      const index = state.drones.findIndex(drone => drone._id === action.payload.droneId);
      if (index !== -1) {
        state.drones[index].status = action.payload.status as any;
      }
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

export const { clearSelectedDrone, updateDrone, updateDroneStatus } = droneSlice.actions;
export default droneSlice.reducer; 