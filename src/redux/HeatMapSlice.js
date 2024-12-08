import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initial_state = {
    "content": [],
    "destination": [],
    "source": []
}

// get the data in asyncThunk
export const getHeatMapData = createAsyncThunk('heatMapData/fetchData', async (args, thunkAPI) => {
    // Simulate fetching data by using the fake_json
    const response = await fetch('http://localhost:5000/getHeatMapData');
    const responseJson = await response.json();
    
    return responseJson;
});

export const heatMapSlice = createSlice({
    name: 'heatMapData',
    initialState: {
        data: initial_state, // Initial state should be an empty array
    },
    extraReducers: builder => {
        builder.addCase(getHeatMapData.fulfilled, (state, action) => {
            state.data = action.payload; // Store fetched data as an array
        });
    }
});

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default heatMapSlice.reducer