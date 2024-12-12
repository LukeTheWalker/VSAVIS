// src/slices/selectionSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const selectionSlice = createSlice({
  name: 'selection',

  initialState: {
    dropdownIDS: "classification",
    dropdownFirewall: "Syslog priority"
  },
  
  reducers: {
    setSelectedValue: (state, action) => {
      const { dropdown, value } = action.payload;
      state[dropdown] = value;
    }
  }
});

export const { setSelectedValue } = selectionSlice.actions;
export default selectionSlice.reducer;