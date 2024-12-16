import './ChordDiagram.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getChordDiagramData } from '../../redux/chordDiagramSlice'; // Adjust the path as needed
import ChordDiagramD3 from './ChordDiagramD3';

function ChordDiagramContainer() {
    // Redux hooks to access state and dispatch actions
    const data = useSelector((state) => state.chordDiagram.data); // Get chord diagram data from the Redux store
    const dispatch = useDispatch();

    // Refs to manage D3 and container div
    const divContainerRef = useRef(null);
    const chordDiagramD3Ref = useRef(null);

    // Fetch the chord diagram data when the component mounts
    useEffect(() => {
        dispatch(getChordDiagramData()); // Dispatch the async thunk to fetch data
    }, [dispatch]);

    // Function to calculate chart size
    const getChartSize = function () {
        let width, height;
        if (divContainerRef.current) {
            width = divContainerRef.current.offsetWidth; // Use the container's width
            height = 500; // Fixed height or adjust dynamically as needed
        }
        return { width: width, height: height };
    };

    // ComponentDidMount - Initialize D3 visualization
    useEffect(() => {
        const chordDiagramD3 = new ChordDiagramD3(divContainerRef.current); // Initialize ChordDiagramD3 instance
        chordDiagramD3.create({ size: getChartSize() }); // Create the chart
        chordDiagramD3Ref.current = chordDiagramD3; // Store the instance in the ref

        return () => {
            // Cleanup - Clear the chart when the component unmounts
            const chordDiagramD3 = chordDiagramD3Ref.current;
            if (chordDiagramD3) {
                chordDiagramD3.clear();
            }
        };
    }, []); // Runs only once on mount

    // ComponentDidUpdate - Render the chart with new data
    useEffect(() => {
        const chordDiagramD3 = chordDiagramD3Ref.current;

        if (data.nodes.length > 0 && data.matrix.length > 0) {
            // Render the chart only if data is present
            chordDiagramD3.render(data);
        }
    }, [data]); // Runs whenever data changes

    return (
        <div
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <div
                ref={divContainerRef}
                className="chordDiagramDivContainer"
                style={{ width: '100%', height: '100%' }}
            ></div>
        </div>
    );
}

export default ChordDiagramContainer;
