import './App.css';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setResized } from './redux/GlobalSlice';
import HeatMapContainer from './components/HeatMap/HeatMapContainer';
import TimeSeriesContainer from './components/TimeSeries/TimeSeriesContainer';
import B2BHistoContainer from './components/B2BHisto/B2BHistoContainer';
import { setSelectedValue } from './redux/SelectionSlice';


function App() {
    const dispatch = useDispatch();
    const resizedRef = useRef(useSelector(state => state.global.resized)); // Use a ref to persist the value

    const handleChange = (dropdown, event) => {
        dispatch(setSelectedValue({ dropdown, value: event.target.value }));
      };
    

    useEffect(() => {
        const handleResize = () => {
            clearTimeout(window.resizeend);
            window.resizeend = setTimeout(() => {
                resizedRef.current = !resizedRef.current;
                dispatch(setResized(resizedRef.current));
            }, 500);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [dispatch]); // Include dispatch in the dependency array

    return (
        <div className="App">
            <HeatMapContainer />
            <TimeSeriesContainer />
            <div className="dropdown-pair">
                <label htmlFor="dropdownIDS" className="dropdown-label">Choose an attribute for the IDS:</label>
                <select id="dropdownIDS" className="dropdown-select" onChange={(e) => handleChange('dropdownIDS', e)} defaultValue="classification">
                    <option value="time">Time</option>
                    <option value="sourceIP">Source IP</option>
                    <option value="sourcePort">Source Port</option>
                    <option value="destIP">Destination IP</option>
                    <option value="destPort">Destination Port</option>
                    <option value="classification">Classification</option>
                    <option value="priority">Priority</option>
                    <option value="label">Label</option>
                </select>
            </div>
            <div className="dropdown-pair">
                <label htmlFor="dropdownIDS" className="dropdown-label">Choose an attribute for the Firewall:</label>
                <select id="dropdownFirewall" className="dropdown-select" onChange={(e) => handleChange('dropdownFirewall', e)} defaultValue="Syslog priority">
                    <option value="Syslog priority">Syslog priority</option>
                    <option value="Operation">Operation</option>
                    <option value="Source IP">Source IP</option>
                    <option value="Destination IP">Destination IP</option>
                    <option value="Destination port">Destination port</option>
                    <option value="Destination service">Destination service</option>
                    <option value="Direction">Direction</option>
                </select>
            </div>
            <B2BHistoContainer />
        </div>
    );
}

export default App;
