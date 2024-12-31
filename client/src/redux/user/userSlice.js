import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signupStart: state => {
      state.loading = true;
    },
    signupSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserStart: state => {
      state.loading = true;
    },
    updateUserSuccess(state, action) {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: state => {
      state.loading = true;
    },
    deleteUserSuccess: state => {
      state.loading = false;
      state.error = null;
      state.currentUser = null;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  signupFailure,
  signupStart,
  signupSuccess,
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserSuccess,
  deleteUserStart,
  deleteUserFailure,
} = userSlice.actions;

export default userSlice.reducer;
