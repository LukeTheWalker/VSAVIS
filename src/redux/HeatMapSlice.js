import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import server from './config';

const initial_state = {
    "content": [],
    "destination": [],
    "source": [],
    "selectedClass": "classification"
}

// get the data in asyncThunk
export const getHeatMapData = createAsyncThunk('heatMapData/fetchData', async (args, thunkAPI) => {
    // Simulate fetching data by using the fake_json
    // const response = await fetch('http://localhost:5000/getHeatMapData');

    const start = args.start;
    const end = args.end;
    const selectedClass = args.selectedClass;

    const queryParameters = new URLSearchParams({
        start: start,
        end: end,
        class: selectedClass
    })

    const response = await fetch(server + '/getHeatMapData?'+ queryParameters.toString(), {
        headers: {
            'ngrok-skip-browser-warning': 'true',
        }
    });
    const responseJson = await response.json();
    
    return responseJson;
});

export const heatMapSlice = createSlice({
    name: 'heatMapData',
    initialState: {
        data: initial_state, // Initial state should be an empty array
    },
    reducers: {
        selectClass: (state, action) => {
            state.data.selectedClass = action.payload;
        }
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
export const { selectClass } = heatMapSlice.actions;