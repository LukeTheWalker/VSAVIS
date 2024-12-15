// src/slices/selectionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialHeatStart = "2012-04-05 17:51:00";
const initialHeatEnd = "2012-04-07 08:59:00";

export const selectionSlice = createSlice({
  name: 'selection',

  initialState: {
    dropdownIDS: "classification",
    dropdownFirewall: "Syslog priority",
    dropdownModeFIR: "count",
    numBins: 500,
    dropdownHeat: "classification",
    heatmapStart: "2012-04-05 17:51:00",
    heatmapEnd: "2012-04-07 08:59:00"
  },
  
  reducers: {
    setSelectedValue: (state, action) => {
      const { dropdown, value } = action.payload;
      state[dropdown] = value;
    },
    setHeatmapChoice: (state, action) => {

      if (action.payload.start === undefined || action.payload.end === undefined) {
          state.heatmapStart = initialHeatStart;
          state.heatmapEnd = initialHeatEnd;
          return;
      }

      state.heatmapStart = action.payload.start;
      state.heatmapEnd = action.payload.end;
    }
  }
});

export const { setSelectedValue, setHeatmapChoice } = selectionSlice.actions;
export default selectionSlice.reducer;