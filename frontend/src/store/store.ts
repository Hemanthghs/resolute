'use client';

import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';
import govReducer from './features/govSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        gov: govReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;