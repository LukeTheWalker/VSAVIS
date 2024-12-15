import './PieChart.css';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPieChartData } from '../../redux/PieChartSlice';
import PieChartD3 from './PieChart-d3';

function PieChartContainer() {
    const data = useSelector(state => state.piechart.data);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const pieChartD3Refs = useRef([]);

    let keys = [];
    if (data) {
        for(let i = 0; i < data.length; i++) {
            keys.push(Object.keys(data[i])[0]);
        }
    }

    const preprocessData = (data) => {
        if (!data) return [];
        const key = Object.keys(data)[0];
        const values = data[key];
        return values
            .map((item) => {
                if (item.value === 0) return null;
                const [label, value] = Object.entries(item)[0];
                return { label, value };
            })
            .filter(Boolean);
    };

    const createHierarchyData = () => {
        if (!data) return { name: "root", children: [] };
        
        return {
            name: "root",
            children: Array.from({ length: data.length }, (_, index) => ({
                name: keys[index],
                value: 1,  // Keep this at 1 for consistent base sizing
                index: index
            }))
        };
    };

    useEffect(() => {
        dispatch(getPieChartData());
    }, [dispatch]);
    
    useEffect(() => {
        if (!data || !data.length || !containerRef.current) return;
    
        // Clear previous content
        d3.select(containerRef.current).selectAll("*").remove();
        pieChartD3Refs.current = [];
    
        // Set up responsive dimensions
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const margin = 40;
    
        const width = containerWidth - margin * 2;
        const height = containerHeight - margin * 2;
    
        // Dynamically calculate chart size
        const numCharts = data.length;
        const rows = Math.ceil(Math.sqrt(numCharts)); // Number of rows/columns
        const chartSize = Math.min(width / rows, height / rows, 150); // Limit max size
    
        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", `translate(${margin},${margin})`);
    
        // D3 pack layout with proportional padding
        const pack = d3.pack()
            .size([width, height])
            .padding(chartSize * 0.2); // Padding relative to chart size
    
        const root = d3.hierarchy(createHierarchyData()).sum(d => d.value);
        const circles = pack(root);
    
        // Draw the charts
        const nodes = svg.selectAll("g.chart-container")
            .data(circles.leaves())
            .join("g")
            .attr("class", "chart-container")
            .attr("transform", d => `translate(${d.x},${d.y})`);
    
        nodes.each(function (d) {
            const group = d3.select(this);
    
            // Set container size for each chart
            const containerSize = d.r * 1.8; // Scale based on radius
    
            // Add pie chart container
            const foreignObject = group.append("foreignObject")
                .attr("x", -containerSize / 2)
                .attr("y", -containerSize / 2)
                .attr("width", containerSize)
                .attr("height", containerSize);
    
            const div = foreignObject.append("xhtml:div")
                .style("width", "100%")
                .style("height", "100%")
                .attr("class", "pie-chart-container");
    
            const pieChart = new PieChartD3(div.node());
            pieChart.create({
                size: { width: containerSize, height: containerSize },
            });
    
            pieChartD3Refs.current[d.data.index] = pieChart;
    
            // Add text label
            group.append("text")
                .attr("dy", containerSize / 2 + 15)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#333")
                .text(d.data.name);
        });
    
        // Update pie chart data
        data.forEach((item, i) => {
            const processedData = preprocessData(item);
            if (pieChartD3Refs.current[i]) {
                pieChartD3Refs.current[i].update(processedData, keys[i]);
            }
        });
    }, [data]);
    

    return (
        <div 
            ref={containerRef} 
            className="packed-charts-wrapper"
        />
    );
}

export default PieChartContainer;