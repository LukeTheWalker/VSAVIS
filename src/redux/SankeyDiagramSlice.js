import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import server from './config';

const initial_state = {
    "nodes": [],
    "links": []
}

// get the data in asyncThunk
export const getSankeyDiagramData = createAsyncThunk('sankeyDiagramData/fetchData', async (args, thunkAPI) => {
    // Simulate fetching data by using the fake_json
    // const response = await fetch('http://localhost:5000/getSankeyData');
    const response = await fetch(server + '/getSankeyData', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    const responseJson = await response.json();
    
    return responseJson;
});

export const sankeyDiagramSlice = createSlice({
    name: 'sankey',
    initialState: {
        data: initial_state, // Initial state should be an empty array
    },
    extraReducers: builder => {
        builder.addCase(getSankeyDiagramData.fulfilled, (state, action) => {
            state.data = action.payload; // Store fetched data as an array
        });
    }
});

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default sankeyDiagramSlice.reducer