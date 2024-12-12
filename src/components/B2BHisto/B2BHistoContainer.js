import './B2BHisto.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getB2BHistoData } from '../../redux/B2BHistoSlice'


import B2BHistoD3 from './B2BHisto-d3'

function B2BHistoContainer() {
    const data = useSelector(state => state.b2bhist.data)
    const resized = useSelector(state => state.global.resized);
    const selectedValueIDS = useSelector(state => state.selection.dropdownIDS);
    const selectedValueFirewall = useSelector(state => state.selection.dropdownFirewall);
    console.log("selectedValueIDS", selectedValueIDS);  
    const dispatch = useDispatch();

    const divB2BHistoContainerRef  = useRef(null);
    const b2BHistoD3Ref = useRef(null)

    const getCharSize = function () {
        let width;
        let height;
        if (divB2BHistoContainerRef.current !== undefined) {
            width=divB2BHistoContainerRef.current.offsetWidth;
            height= 1000;
        }
        return { width: width, height: height };
    }

    useEffect(() => 
        { dispatch(getB2BHistoData({mode: "count", bins:500})); }
    , [dispatch]);

    // did mount called once the component did mount
    useEffect(() => {
        console.log("B2BHistoContainer useEffect for mounting");
        const b2BHistoD3 = new B2BHistoD3(divB2BHistoContainerRef.current);
        b2BHistoD3.create({ size: getCharSize() });
        b2BHistoD3Ref.current = b2BHistoD3;
        return () => {
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("B2BHistoContainer useEffect [] return function, called when the component did unmount...");
            const b2BHistoD3 = b2BHistoD3Ref.current;
            b2BHistoD3.clear()
        }
    }, [resized]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        console.log("B2BHistoContainer useEffect with dependency [data, dispatch], called each time matrixData changes...");
        const b2BHistoD3 = b2BHistoD3Ref.current;

        b2BHistoD3.renderB2BHisto(data);
    }, [data, resized, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(() => {
        dispatch(getB2BHistoData({fir: selectedValueFirewall,ids: selectedValueIDS, mode: "count", bins:500}));
    }, [selectedValueIDS, selectedValueFirewall, dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.


    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divB2BHistoContainerRef} className="timeSerieDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default B2BHistoContainer;