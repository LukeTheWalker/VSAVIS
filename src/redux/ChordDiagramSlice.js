import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import server from './config';
import { chord } from 'd3';

const initial_state = {
    "nodes": [],
    "matrix": [],
    "links": []
}

// get the data in asyncThunk
export const getChordDiagramData = createAsyncThunk('chordDiagramData/fetchData', async (args, thunkAPI) => {
    // Simulate fetching data by using the fake_json
    // const response = await fetch('http://localhost:5000/getChordDiagramData');
    const response = await fetch(server + '/getChordDiagramData', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    const responseJson = await response.json();
    
    return responseJson;
});

export const chordDiagramSlice = createSlice({
    name: 'chordDiagram',
    initialState: {
        data: initial_state, // Initial state should be an empty array
    },
    extraReducers: builder => {
        builder.addCase(getChordDiagramData.fulfilled, (state, action) => {
            state.data = action.payload; // Store fetched data as an array
        });
    }
});

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default chordDiagramSlice.reducer