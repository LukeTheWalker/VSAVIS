import './PieChart.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPieChartData } from '../../redux/PieChartSlice';
import PieChartD3 from './PieChart-d3';

function PieChartContainer() {
    let data = useSelector(state => state.piechart.data);
    let keys = []
    
    //collect the keys from the data
    for(let i = 0; i < data.length; i++){
        keys.push(Object.keys(data[i])[0]);
    }

    const resized = useSelector(state => state.global.resized);

    const dispatch = useDispatch();
    const divPieChartContainerRefs = useRef([]); // Array to hold refs for each pie chart
    const pieChartD3Refs = useRef([]); // Array to hold D3 instances

    const getContainerSize = (index) => {
        if (divPieChartContainerRefs.current[index]) {
            const width = window.innerWidth * .12;
            // const height = window.innerHeight * 0.4
            // const minSize = Math.min(width, height);
            return {
                width: width,
                height: width
            };
        }
        return { width: 0, height: 0 };
    };

    // Preprocess the data for the pie chart
    const preprocessData = (data) => {
        if (!data) return [];
        const key = Object.keys(data)[0]; // Get the first key (e.g., "IRC Trojan")
        const values = data[key]; // Array of objects
        return values.map((item) => {
            if (item.value === 0) return null; // Skip zero-value items
            const [label, value] = Object.entries(item)[0];
            return { label, value };
        }).filter(Boolean);
    };

    // Initialize the pie charts when the component mounts
    useEffect(() => {
        // Create a pie chart for each item in the data (without using map)
        for (let i = 0; i < data.length; i++) {
            const pieChartD3 = new PieChartD3(divPieChartContainerRefs.current[i]);
            pieChartD3.create({ size: getContainerSize(i) });
            pieChartD3Refs.current[i] = pieChartD3;
        }

        return () => {
            pieChartD3Refs.current.forEach((pieChart) => pieChart.clear());
        };
    }, [data]);

    // Update pie charts with the processed data
    useEffect(() => {
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item && divPieChartContainerRefs.current[i]) {
                const processedData = preprocessData(item);
                pieChartD3Refs.current[i].update(processedData, keys[i]);
            }
        }
    }, [data]);

    useEffect(() => {
        dispatch(getPieChartData());
    }, [dispatch]);

    return (
        <div className="pie-charts-wrapper">
            {/* Dynamically create divs for each pie chart without using map */}
            {(() => {
                const divs = [];
                for (let i = 0; i < data.length; i++) {
                    divs.push(
                        <div key={i} className="pie-chart-container">
                            <div
                                ref={(el) => divPieChartContainerRefs.current[i] = el}
                                className="pie-chart-d3"
                            ></div>
                            <div className="pie-chart-name">
                                {keys[i]} {/* Display name from keys array */}
                            </div>
                        </div>
                    );
                }
                return divs;
            })()}
        </div>
    );
    
}

export default PieChartContainer;
