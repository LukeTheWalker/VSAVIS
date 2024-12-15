import './HistoTimeLine.css'
import { useEffect, useRef} from 'react';
import { useSelector, useDispatch } from 'react-redux';


import HistoTimeLineD3 from './HistoTimeLine-d3'
import { getHistoTimeLineData, selectTimeLine } from '../../redux/HistoTimeLineSlice';


function HistoTimeLineContainer() {

    const data = useSelector(state => state.histoTimeline.data);
    const resized = useSelector(state => state.global.resized);

    const dispatch = useDispatch();

    const divHistoTimeLineContainerRef = useRef(null);
    const histoTimeLineD3Ref = useRef(null);

    const getCharSize = function () {
        let width;
        let height;
        if (divHistoTimeLineContainerRef.current !== undefined) {
            width=divHistoTimeLineContainerRef.current.offsetWidth;
            height= 100;
        }
        return { width: width, height: height };
    }

    useEffect(() => {
        dispatch(getHistoTimeLineData());
    },[dispatch]);

    useEffect(() => {
        const histoTimeLineD3 = new HistoTimeLineD3(divHistoTimeLineContainerRef.current);
        histoTimeLineD3.create({ size: getCharSize()});
        histoTimeLineD3Ref.current = histoTimeLineD3;

        return () => {
            const histoTimeLineD3 = histoTimeLineD3Ref.current;
            histoTimeLineD3.clear();
        }
    }, [resized]);

    useEffect(() => {

        if (data.length === 0) {
            return;
        }


        const behaviors = {
            timeLineSelection: (interval) => {
                dispatch(selectTimeLine({
                    start: interval.start,
                    end: interval.end
                }));
                return;
            }
        }

        const histoTimeLineD3 = histoTimeLineD3Ref.current;
        histoTimeLineD3.renderHistoTimeLine(data, behaviors);
    }, [data, resized, dispatch]);

    return (
        <div style={{ width: "100%", height: "100%", padding: "2px 10px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={divHistoTimeLineContainerRef} className="HistoTimeLineDivContainer" style={{ width: "100%", height: "100%" }}> </div>
        </div>
    )
}

export default HistoTimeLineContainer;