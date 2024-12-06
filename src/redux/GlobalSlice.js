import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    resized: false
};

const globalSlice = createSlice({
    name: 'globalSlice',
    initialState: initialState,
    reducers: {
        setResized: (state, action) => {
            state.resized = action.payload;
        },
    },
});

export const { setResized } = globalSlice.actions;

export default globalSlice.reducer;