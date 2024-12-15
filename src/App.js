import './App.css';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setResized } from './redux/GlobalSlice';
import HeatMapContainer from './components/HeatMap/HeatMapContainer';
import TimeSeriesContainer from './components/TimeSeries/TimeSeriesContainer';
import B2BHistoContainer from './components/B2BHisto/B2BHistoContainer';
import HistoTimeLineContainer from './components/HistoTimeLine/HistoTimeLineContainer';
import { setSelectedValue } from './redux/SelectionSlice';
import PieChartContainer from './components/PieChart/PieChartContainer';

function App() {
    const dispatch = useDispatch();
    const resizedRef = useRef(useSelector(state => state.global.resized));

    const handleChange = (dropdown, event) => {
        event.preventDefault();
        dispatch(setSelectedValue({ dropdown, value: event.target.value }));
    };

    const handleChangeForm = (event) => {
        event.preventDefault(); 
        dispatch(setSelectedValue({ dropdown: 'numBins', value: event.target.numBinsName.value }));
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
    }, [dispatch]);


    const selectedValueIDS = useSelector(state => state.selection.dropdownIDS);
    const selectedValueFirewall = useSelector(state => state.selection.dropdownFirewall);
    const selectedValueModeFIR = useSelector(state => state.selection.dropdownModeFIR);
    const selectedValueNumBins = useSelector(state => state.selection.numBins);
    const selectedValueHeat = useSelector(state => state.selection.dropdownHeat);

    return (
        <div className="App">
            <TimeSeriesContainer />

            <div className="dropdown-grid">
                {/* Upper left: Firewall and Mode */}
                <div className="grid-item firewall-mode">
                    <label htmlFor="dropdownFirewall" className="dropdown-label">Choose an attribute for the Firewall:</label>
                    <select
                        id="dropdownFirewall"
                        className="dropdown-select"
                        onChange={(e) => handleChange('dropdownFirewall', e)}
                        defaultValue={selectedValueFirewall}
                    >
                        <option value="Syslog priority">Syslog priority</option>
                        <option value="Operation">Operation</option>
                        <option value="Destination port">Destination port</option>
                        <option value="Destination service">Destination service</option>
                        <option value="Direction">Direction</option>
                        <option value="Protocol">Protocol</option>
                        <option value="Destination IP">Destination IP</option>
                    </select>

                    <label htmlFor="dropdownModeFIR" className="dropdown-label">Choose an attribute for the Firewall Mode:</label>
                    <select
                        id="dropdownModeFIR"
                        className="dropdown-select"
                        onChange={(e) => handleChange('dropdownModeFIR', e)}
                        defaultValue={selectedValueModeFIR}
                    >
                        <option value="count">Count</option>
                        <option value="log">Log</option>
                        <option value="unique">Unique</option>
                    </select>

                    <label htmlFor="dropdownHeat" className="dropdown-label">Choose an attribute for the HeatMap:</label>
                    <select
                        id="dropdownHeat"
                        className="dropdown-select"
                        onChange={(e) => handleChange('dropdownHeat', e)}
                        defaultValue={selectedValueHeat}
                    >
                        <option value="classification">IDS/Classification</option>
                        <option value="priority">IDS/Priority</option>
                        <option value="label">IDS/Label</option>
                        <option value="Syslog priority">FIR/Syslog priority</option>
                        <option value="Operation">FIR/Operation</option>
                        <option value="Protocol">FIR/Protocol</option>
                        <option value="Destination service">FIR/Destination service</option>
                        <option value="Direction">FIR/Direction</option>
                    </select>
                </div>

                {/* Upper right: IDS */}
                <div className="grid-item ids">
                    <label htmlFor="dropdownIDS" className="dropdown-label">Choose an attribute for the IDS:</label>
                    <select
                        id="dropdownIDS"
                        className="dropdown-select"
                        onChange={(e) => handleChange('dropdownIDS', e)}
                        defaultValue={selectedValueIDS}
                    >
                        <option value="sourceIP">Source IP</option>
                        <option value="sourcePort">Source Port</option>
                        <option value="destIP">Destination IP</option>
                        <option value="destPort">Destination Port</option>
                        <option value="classification">Classification</option>
                        <option value="priority">Priority</option>
                        <option value="label">Label</option>
                    </select>
                </div>

                {/* Lower: Bins form */}
                <div className="grid-item bins">
                    <form onSubmit={handleChangeForm}>
                        <label htmlFor="numBins" className="dropdown-label">Number of BINS:</label>
                        <input
                            type="number"
                            id="numBins"
                            name="numBinsName"
                            className="input-field"
                            defaultValue={selectedValueNumBins}
                        />
                        <input
                            type="submit"
                            value="Submit"
                            className="btn-submit"
                        />
                    </form>
                </div>
            </div>
            <HistoTimeLineContainer />
            <B2BHistoContainer />
            <hr className="separator" />
            <br />
            <div className="HeatAndPieContainer w-full grid grid-cols-2 gap-4">
                <div className="border rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Heatmap</h2>
                    </div>
                    <div className="p-4">
                    <HeatMapContainer />
                    </div>
                </div>
                
                <div className="border rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Pie Chart</h2>
                    </div>
                    <div className="p-4">
                    <PieChartContainer />
                    </div>
                </div>
            </div>
        </div>

    );
}

export default App;