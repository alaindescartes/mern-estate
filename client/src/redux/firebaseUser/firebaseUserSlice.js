import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  firebaseUser: null,
  isAuthenticated: false,
};

const firebaseAuthSlice = createSlice({
  name: 'firebaseAuth',
  initialState,
  reducers: {
    setFirebaseUser: (state, action) => {
      state.firebaseUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearFirebaseUser: state => {
      state.firebaseUser = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setFirebaseUser, clearFirebaseUser } = firebaseAuthSlice.actions;

export default firebaseAuthSlice.reducer;
