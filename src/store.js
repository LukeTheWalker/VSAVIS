import { configureStore } from '@reduxjs/toolkit'
import heatmapReducer from './redux/HeatMapSlice'
import globalReducer from './redux/GlobalSlice'
import b2bHistoReducer from './redux/B2BHistoSlice'

export default configureStore({
  reducer: {
    heatmap: heatmapReducer,
    global: globalReducer,
    b2bhist: b2bHistoReducer
    }
})