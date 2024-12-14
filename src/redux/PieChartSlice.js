import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import server from './config';

const initial_state = {
    "content": []
}

// get the data in asyncThunk
export const getPieChartData = createAsyncThunk('piechart/fetchData', async (args, thunkAPI) => {
    // Simulate fetching data by using the fake_json
    // const response = await fetch('http://localhost:5000/getHeatMapData');
    const response = await fetch(server + '/getPieChartData', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    const responseJson = await response.json();
    
    return responseJson;
});

export const pieChartSlice = createSlice({
    name: 'piechart',
    initialState: {
        data: initial_state, // Initial state should be an empty array
    },
    extraReducers: builder => {
        builder.addCase(getPieChartData.fulfilled, (state, action) => {
            state.data = action.payload; // Store fetched data as an array
        });
    }
});

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default pieChartSlice.reducer