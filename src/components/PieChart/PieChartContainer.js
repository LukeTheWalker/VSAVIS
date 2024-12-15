import './PieChart.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPieChartData } from '../../redux/PieChartSlice';
import PieChartD3 from './PieChart-d3';

function PieChartContainer() {
    const data = useSelector(state => state.piechart.data);
    const resized = useSelector(state => state.global.resized);
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const pieChartD3Ref = useRef(null);

    useEffect(() => {
        dispatch(getPieChartData());
    }, [dispatch]);

    const getChartSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.offsetWidth;
            height = 500;
        }
        return { width: width, height: height };
    }

    // Did mount - called once the component mounts
    useEffect(() => {
        console.log("PieChartContainer useEffect for mounting");
        
        // Correct instantiation with capital 'P'
        const pieChartD3 = new PieChartD3(divContainerRef.current);
        pieChartD3.create({ size: getChartSize() });
        pieChartD3Ref.current = pieChartD3;

        return () => {
            // Did unmount, the return function is called once the component is removed from the screen
            console.log("PieChartContainer useEffect [] return function, called when the component did unmount...");
            const pieChartD3 = pieChartD3Ref.current;
            pieChartD3.clear();
        }
    }, [resized]); // Empty dependency array ensures this runs only on mount and when resized changes

    // Did update, called each time dependencies change
    useEffect(() => {
        console.log("PieChartContainer useEffect with dependency [data, resized, dispatch], called each time data changes...");
        
        const pieChartD3 = pieChartD3Ref.current;

        // Assuming the method is named renderPieChart based on your code
        pieChartD3.renderPieChart(data);

    }, [data, resized, dispatch]);

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divContainerRef} className="piechartDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default PieChartContainer;