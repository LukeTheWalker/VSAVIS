import './HeatMap.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import HeatMapD3 from './HeatMap-d3'

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// // get the data in asyncThunk
// export const getHeatMapData = createAsyncThunk('heatMapData/fetchData', async (args,thunkAPI) => {
//   const response = await fetch('http://localhost:5000/getHeatMapData');
//   const responseJson = await response.json();
//   return responseJson.projection.map((item,i)=>{
//     return {xValue:item[0], yValue:item[1], index:i, category:responseJson.categories[i]};
//   });
//   // when a result is returned, extraReducer below is triggered with the case getProjectionData.fulfilled
// })

// export const heatMapSlice = createSlice({
//   name: 'heatMapData',
//   initialState: {
//     data: [], // Initial state should be an empty array
// },
// extraReducers: builder => {
//     builder.addCase(getHeatMapData.fulfilled, (state, action) => {
//         state.data = action.payload; // Store fetched data as an array
//     });
// }
// })

// // Action creators are generated for each case reducer function
// // export const { reducerName } = dataSetSlice.actions

// export default heatMapSlice.reducer

function HeatMapContainer() {
    // const data = useSelector(state => state.heatMapData.data)
    const data = null;
    const dispatch = useDispatch();

    const resized = useSelector(state => state.global.resized);

    const divContainerRef = useRef(null);
    const heatmapD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.clientWidth
            height = divContainerRef.current.clientHeight - 50 
        }
        return { width: width, height: height };
    }

    // did mount called once the component did mount
    useEffect(() => {
        console.log("HeatMapContainer useEffect for mounting");
        const heatmapD3 = new HeatMapD3(divContainerRef.current);
        heatmapD3.create({ size: getCharSize() });
        heatmapD3Ref.current = heatmapD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("HeatMapContainer useEffect [] return function, called when the component did unmount...");
            const heatmapD3 = heatmapD3Ref.current;
            heatmapD3.clear()
        }
    }, [resized]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("HeatMapContainer useEffect with dependency [data, resized, xvalues, dispatch], called each time matrixData changes...");
        const heatmapD3 = heatmapD3Ref.current;

        heatmapD3.renderHeatMap(data);
    }, [data, resized, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divContainerRef} className="heatmapDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default HeatMapContainer;
