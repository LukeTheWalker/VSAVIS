import './SankeyDiagram.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSankeyDiagramData } from '../../redux/SankeyDiagramSlice'; 
import SankeyDiagramD3 from './SankeyDiagram-d3';
function removeLastLink(data) {
    const { nodes, links } = data;

    // Remove the last link
    const filteredLinks = links.slice(0, -1); // Excludes the last element

    // Return the updated data
    return {
        nodes,
        links: filteredLinks
    };
}
function SankeyDiagramContainer() {
    // Redux hooks to access state and dispatch actions
    const data_previous = useSelector((state) => state.sankey.data); // Get Sankey diagram data from Redux store
    const dispatch = useDispatch();
    
    const data = removeLastLink(data_previous);

    

    // Refs to manage D3 instance and container div
    const divContainerRef = useRef(null);
    const sankeyDiagramD3Ref = useRef(null);

    // Fetch Sankey diagram data when the component mounts
    useEffect(() => {
        dispatch(getSankeyDiagramData()); // Dispatch the async thunk to fetch data
    }, [dispatch]);

    // Function to calculate chart size
    const getChartSize = function () {
        let width, height;
        if (divContainerRef.current) {
            width = divContainerRef.current.offsetWidth; // Use the container's width
            height = 500; // Fixed height or dynamically adjust as needed
        }
        return { width: width, height: height };
    };

    // ComponentDidMount - Initialize D3 visualization
    useEffect(() => {
        const sankeyDiagramD3 = new SankeyDiagramD3(divContainerRef.current); // Initialize SankeyDiagramD3 instance
        sankeyDiagramD3.create({ size: getChartSize() }); // Create the chart
        sankeyDiagramD3Ref.current = sankeyDiagramD3; // Store the instance in the ref

        return () => {
            // Cleanup - Clear the chart when the component unmounts
            const sankeyDiagramD3 = sankeyDiagramD3Ref.current;
            if (sankeyDiagramD3) {
                sankeyDiagramD3.clear();
            }
        };
    }, []); // Runs only once on mount

    // ComponentDidUpdate - Render the chart with new data
    useEffect(() => {
        const sankeyDiagramD3 = sankeyDiagramD3Ref.current;

        if (data.nodes?.length > 0 && data.links?.length > 0) {
            // Render the chart only if data is present
            sankeyDiagramD3.render(data);
        }
    }, [data]); // Runs whenever data changes

    return (
        <div
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <div
                ref={divContainerRef}
                className="sankeyDiagramDivContainer"
                style={{ width: '100%', height: '100%' }}
            ></div>
        </div>
    );
}

export default SankeyDiagramContainer;
