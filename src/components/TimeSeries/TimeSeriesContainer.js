import './TimeSeries.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import TimeSeriesD3 from './TimeSeries-d3'

function TimeSeriesContainer() {
    // const data = useSelector(state => state.dataSet.data)
    const data = null;
    const resized = useSelector(state => state.global.resized);
    const dispatch = useDispatch();

    const divTimeSeriesContainerRef  = useRef(null);
    const timeSerieD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divTimeSeriesContainerRef.current !== undefined) {
            width = divTimeSeriesContainerRef.current.clientWidth
            height = divTimeSeriesContainerRef.current.clientHeight - 50
        }
        if (width > height) {
            width = height;
        } else {
            height = width;
        }
        return { width: width, height: height };
    }

    // did mount called once the component did mount
    useEffect(() => {
        console.log("TimeSeriesContainer useEffect for mounting");
        const timeSerieD3 = new TimeSeriesD3(divTimeSeriesContainerRef.current);
        timeSerieD3.create({ size: getCharSize() });
        timeSerieD3Ref.current = timeSerieD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("TimeSeriesContainer useEffect [] return function, called when the component did unmount...");
            const timeSerieD3 = timeSerieD3Ref.current;
            timeSerieD3.clear()
        }
    }, [resized]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("TimeSeriesContainer useEffect with dependency [data, dispatch], called each time matrixData changes...");
        const timeSerieD3 = timeSerieD3Ref.current;

        timeSerieD3.renderTimeSeries(data);
    }, [data, resized, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divTimeSeriesContainerRef} className="timeSerieDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default TimeSeriesContainer;