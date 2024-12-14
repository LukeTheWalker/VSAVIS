import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import server from './config';



export const getHistoTimeLineData = createAsyncThunk('histoTimeLineSlice/getHistoTimeLineDataDefault', async (args, thunkAPI) => {

    // Simply ask the server to provide relevant information
    const response = await fetch(server + '/getHistoTimeLineData', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    const responseJSON = await response.json();
    return responseJSON;
});

export const histoTimeLineSlice = createSlice({
    name: 'histoTimeLineSlice',
    initialState: {
        data: [],
        selectedInterval: {start: null, end: null}
    },
    reducers: {
        // reducer for the selection of the time line
        selectTimeLine: (state, action) => {
            state.selectedInterval.start = action.payload.start;
            state.selectedInterval.end = action.payload.end;

            console.log("Selected interval: ", state.selectedInterval.start, state.selectedInterval.end);
        }


    },
    extraReducers: 
        builder => {
            builder.addCase(getHistoTimeLineData.fulfilled, (state, action) => {
                console.log("AA");
                state.data = action.payload
            })
        }
    
});

export const { selectTimeLine } = histoTimeLineSlice.actions;
export default histoTimeLineSlice.reducer;