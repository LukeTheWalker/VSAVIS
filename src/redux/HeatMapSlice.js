import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// get the data in asyncThunk
export const getHeatMapData = createAsyncThunk('heatMapData/fetchData', async (args,thunkAPI) => {
  const response = await fetch('http://localhost:5000/getHeatMapData');
  const responseJson = await response.json();
  return responseJson.projection.map((item,i)=>{
    return {xValue:item[0], yValue:item[1], index:i, category:responseJson.categories[i]};
  });
  // when a result is returned, extraReducer below is triggered with the case getProjectionData.fulfilled
})

export const heatMapSlice = createSlice({
  name: 'heatMapData',
  initialState: {
    data: [], // Initial state should be an empty array
},
extraReducers: builder => {
    builder.addCase(getHeatMapData.fulfilled, (state, action) => {
        state.data = action.payload; // Store fetched data as an array
    });
}
})

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default heatMapSlice.reducer