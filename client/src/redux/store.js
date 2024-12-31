import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userSlice from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import firebaseUserSlice from './firebaseUser/firebaseUserSlice.js';

const rootReducer = combineReducers({
  user: userSlice,
  firebaseUser: firebaseUserSlice,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedreducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedreducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
