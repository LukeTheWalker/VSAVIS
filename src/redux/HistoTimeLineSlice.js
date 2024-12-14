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

    const count = responseJSON.content.counts;
    const times = responseJSON.content.times;


    console.log("Response JSON", responseJSON);

    const histogram = times.map((time, index) => {
        const currentTime = new Date(time).getTime();
        const nextTime = index < times.length - 1 ? new Date(times[index + 1]).getTime() : currentTime;
        const averageTime = new Date((currentTime + nextTime) / 2).toISOString();
        return {
            "time": averageTime,
            "count": count[index]
        }
    });

    histogram.pop();

    const final_obj = {
        "timeline": responseJSON,
        "histogram": histogram,
        "events": responseJSON.content.events
    }

    console.log("Final obj", final_obj);


    return final_obj;
});

export const histoTimeLineSlice = createSlice({
    name: 'histoTimeLineSlice',
    initialState: {
        data: [],
        selectedInterval: {start: "2012-04-05 17:51:00", end: "2012-04-07 08:59:00"}
    },
    reducers: {
        // reducer for the selection of the time line
        selectTimeLine: (state, action) => {
            state.selectedInterval.start = action.payload.start;
            state.selectedInterval.end = action.payload.end;
        }


    },
    extraReducers: 
        builder => {
            builder.addCase(getHistoTimeLineData.fulfilled, (state, action) => {
                state.data = action.payload
            })
        }
    
});

export const { selectTimeLine } = histoTimeLineSlice.actions;
export default histoTimeLineSlice.reducer;