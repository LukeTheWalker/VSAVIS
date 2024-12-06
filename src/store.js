import { configureStore } from '@reduxjs/toolkit'
import heatmapReducer from './redux/HeatMapSlice'
import globalReducer from './redux/GlobalSlice'
export default configureStore({
  reducer: {
    heatmap: heatmapReducer,
    global: globalReducer
    }
})