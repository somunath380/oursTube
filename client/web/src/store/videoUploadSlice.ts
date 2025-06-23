import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface VideoUploadState {
  isUploading: boolean;
  success: boolean;
  uploadedVideo: any | null;
}

const initialState: VideoUploadState = {
  isUploading: false,
  success: false,
  uploadedVideo: null,
};

export const uploadVideo = createAsyncThunk(
  'videoUpload/upload',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

const videoUploadSlice = createSlice({
  name: 'videoUpload',
  initialState,
  reducers: {
    resetUpload: (state) => {
      state.isUploading = false;
      state.success = false;
      state.uploadedVideo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.isUploading = true;
        state.success = false;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.isUploading = false;
        state.success = true;
        state.uploadedVideo = action.payload;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isUploading = false;
      });
  },
});

export const { resetUpload } = videoUploadSlice.actions;
export default videoUploadSlice.reducer; 