import './HeatMap.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import HeatMapD3 from './HeatMap-d3'
import { getHeatMapData } from '../../redux/HeatMapSlice';
import { use } from 'react';

function HeatMapContainer() {
    const data = useSelector(state => state.heatmap.data)

    const dispatch = useDispatch();

    const resized = useSelector(state => state.global.resized);

    const divContainerRef = useRef(null);
    const heatmapD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width=divContainerRef.current.offsetWidth;
            height= 500;
        }
        return { width: width, height: height };
    }

    useEffect(() => 
        { dispatch(getHeatMapData()); }
    , []);

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
        console.log("HeatMapContainer useEffect with dependency [data, resized, dispatch], called each time matrixData changes...");
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
