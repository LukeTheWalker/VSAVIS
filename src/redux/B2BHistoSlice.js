import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import server from './config';

const initial_state = {
    "content": [],
    "classifications": [],
    "times": []
}


const defaultParams = {
    fir: "Syslog priority",
    ids: "classification",
    bins: 100,
    mode: 'count',
    start: "2012-04-05 17:51:00",
    end: "2012-04-07 08:59:00"
};

/**
 * Fetches B2B histogram data with the provided parameters.
 * 
 * @function
 * @async
 * @param {Object} args - The arguments object.
 * @param {string} [args.fir] - The FIR parameter, defaults to "Syslog priority".
 * @param {string} [args.ids] - The IDS parameter, defaults to "classification".
 * @param {string} [args.bins] - The BINS parameter, defaults to 100.
 * @param {string} [args.mode] - The MODE parameter, indicating how to aggregate the data for the firewall, defaults to "count".
 * @returns {Promise<Object>} The response JSON containing the B2B histogram data.
 */
export const getB2BHistoData = createAsyncThunk('b2bHistoSlice/getB2BHistData', async (args, thunkAPI) => {

    if (args === undefined) args = {};

    const fir_param = args.fir === undefined ? defaultParams.fir : args.fir;
    const ids_param = args.ids === undefined ? defaultParams.ids : args.ids;
    const bins_param = args.bins === undefined ? defaultParams.bins : args.bins;
    const mode_param = args.mode === undefined ? defaultParams.mode : args.mode;
    const start_param = args.start === undefined ? defaultParams.start : args.start;
    const end_param = args.end === undefined ? defaultParams.end : args.end;

    const queryParameters = new URLSearchParams({
        fir: fir_param,
        ids: ids_param,
        bins: bins_param,
        mode: mode_param,
        start: start_param,
        end: end_param
    })  

    // console.log("Query parameters: ", queryParameters);
    // console.log("Query string: ", queryParameters.toString());

    // const response = await fetch('http://localhost:5000/getB2BHistData?' + queryParameters.toString());
    const response = await fetch(server + '/getB2BHistData?' + queryParameters.toString(), {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    const responseJson = await response.json();

    // console.log("Response JSON: ", responseJson);
    return responseJson;
});

export const b2bHistoSlice = createSlice({
    name: 'b2bHistoSlice',
    initialState: {
        data: initial_state, // Initial state should be an empty array
    },
    extraReducers: 
        builder => {
            builder.addCase(getB2BHistoData.fulfilled, (state, action) => {
                state.data = action.payload; // Store fetched data as an array
                // console.log("Loading HISTO data with params");
            });
        }
});

// Action creators are generated for each case reducer function
// export const { reducerName } = dataSetSlice.actions

export default b2bHistoSlice.reducer