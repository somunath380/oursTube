import { configureStore } from '@reduxjs/toolkit';
import videoUploadReducer from './videoUploadSlice';

export const store = configureStore({
  reducer: {
    videoUpload: videoUploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 