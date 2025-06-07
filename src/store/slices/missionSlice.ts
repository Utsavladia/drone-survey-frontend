import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IMission, CreateMissionInput } from '../../types/mission';
import { missionService } from '../../services/missionService';

interface MissionState {
  missions: IMission[];
  currentMission: IMission | null;
  loading: boolean;
  error: string | null;
}

const initialState: MissionState = {
  missions: [],
  currentMission: null,
  loading: false,
  error: null
};

export const fetchMissions = createAsyncThunk(
  'missions/fetchMissions',
  async () => {
    const missions = await missionService.getAllMissions();
    return missions;
  }
);

export const createMission = createAsyncThunk(
  'missions/createMission',
  async (mission: CreateMissionInput) => {
    const newMission = await missionService.createMission(mission);
    return newMission;
  }
);

export const getCurrentMission = createAsyncThunk(
  'missions/getCurrentMission',
  async (droneId: string) => {
    const mission = await missionService.getCurrentMission(droneId);
    return mission;
  }
);

const missionSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMissions.fulfilled, (state, action) => {
        state.loading = false;
        state.missions = action.payload;
      })
      .addCase(fetchMissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch missions';
      })
      .addCase(createMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMission.fulfilled, (state, action) => {
        state.loading = false;
        state.missions.push(action.payload);
        state.currentMission = action.payload;
      })
      .addCase(createMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create mission';
      })
      .addCase(getCurrentMission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentMission.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMission = action.payload;
      })
      .addCase(getCurrentMission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get current mission';
      });
  }
});

export const { clearError } = missionSlice.actions;
export default missionSlice.reducer; 