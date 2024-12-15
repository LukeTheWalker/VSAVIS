import './B2BHisto.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getB2BHistoData } from '../../redux/B2BHistoSlice'


import B2BHistoD3 from './B2BHisto-d3'
import { getHeatMapData } from '../../redux/HeatMapSlice';
import { setHeatmapChoice } from '../../redux/SelectionSlice';

function B2BHistoContainer() {
    const data = useSelector(state => state.b2bhist.data)
    const resized = useSelector(state => state.global.resized);
    const selectedValueIDS = useSelector(state => state.selection.dropdownIDS);
    const selectedValueFirewall = useSelector(state => state.selection.dropdownFirewall);
    const selectedValueModeFIR = useSelector(state => state.selection.dropdownModeFIR);
    const selectedValueNumBins = useSelector(state => state.selection.numBins);
    const selectedInterval = useSelector(state => state.histoTimeline.selectedInterval);

    const selectedHeatmapClass = useSelector(state => state.selection.dropdownHeat);

    
    const dispatch = useDispatch();

    const divB2BHistoContainerRef  = useRef(null);
    const b2BHistoD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divB2BHistoContainerRef.current !== undefined) {
            width=divB2BHistoContainerRef.current.offsetWidth;
            height= 500;
        }
        return { width: width, height: height };
    }

    // useEffect(() => 
    //     { dispatch(getB2BHistoData({mode: "count", bins:5})); }
    // , [dispatch]);

    // did mount called once the component did mount
    useEffect(() => {
        const b2BHistoD3 = new B2BHistoD3(divB2BHistoContainerRef.current);
        b2BHistoD3.create({ size: getCharSize() });
        b2BHistoD3Ref.current = b2BHistoD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            const b2BHistoD3 = b2BHistoD3Ref.current;
            b2BHistoD3.clear()
        }
    }, [resized]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        const b2BHistoD3 = b2BHistoD3Ref.current;
        const behavior = {
            timelineSelection: (interval) => {
                dispatch(setHeatmapChoice({ 
                    start: new Date(interval.start).toISOString().slice(0, 19).replace('T', ' '),
                    end: new Date(interval.end).toISOString().slice(0, 19).replace('T', ' ')
                 }));
            }
        };

        b2BHistoD3.renderB2BHisto(data, behavior);
    }, [data, resized, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        dispatch(
            getB2BHistoData({
                fir: selectedValueFirewall,
                ids: selectedValueIDS, 
                mode: selectedValueModeFIR, 
                bins:selectedValueNumBins,
                start: selectedInterval.start, 
                end: selectedInterval.end
            }));
    }, [selectedValueIDS, selectedValueFirewall, selectedValueModeFIR, selectedValueNumBins, selectedInterval, dispatch]);


    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divB2BHistoContainerRef} className="B2BHistoDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default B2BHistoContainer;