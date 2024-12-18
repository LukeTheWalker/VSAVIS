import { configureStore } from '@reduxjs/toolkit'
import heatmapReducer from './redux/HeatMapSlice'
import globalReducer from './redux/GlobalSlice'
import b2bHistoReducer from './redux/B2BHistoSlice'
import selectSliceReducer from './redux/SelectionSlice'
import histoTimeLineReducer from './redux/HistoTimeLineSlice'
import PieChartReducer from './redux/PieChartSlice'
import ChordDiagramReducer from './redux/ChordDiagramSlice'
import sankeyDiagramReducer from './redux/SankeyDiagramSlice'

export default configureStore({
  reducer: {
    heatmap: heatmapReducer,
    global: globalReducer,
    b2bhist: b2bHistoReducer,
    selection: selectSliceReducer,
    histoTimeline: histoTimeLineReducer,
    piechart: PieChartReducer,
    chordDiagram: ChordDiagramReducer,
    sankey: sankeyDiagramReducer
    }
})