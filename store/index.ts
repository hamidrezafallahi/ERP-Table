import {
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import ServiceRootReducer from '@services/index';
import sliceRootReducer from '@slice/index';
import {
  createConfigSyncMiddleware,
} from '@store/middleware/syncConfigMiddleware';

const { serviceMiddleware, serviceReducer } = ServiceRootReducer();
const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistorReducer = persistReducer(
  persistConfig,
  sliceRootReducer.withPersist
);
const AppReduxStore = configureStore({
  reducer: {
    ...serviceReducer,
    withoutPersist: sliceRootReducer.withoutPersist,
    withPersist: persistorReducer,
  },
  middleware: (getDefaultMiddleware)=>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/PURGE"],
      },
    })
      .concat(serviceMiddleware)
      .concat(createConfigSyncMiddleware()),
});

export const persistor = persistStore(AppReduxStore);
export default AppReduxStore;

export type RootState = ReturnType<typeof AppReduxStore.getState>;
export type AppDispatch = typeof AppReduxStore.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
 
AppReduxStore.subscribe(() => {
  const state = AppReduxStore.getState();
  const sliceState = { ...state.withPersist, ...state.withoutPersist };
  console.log("currentState", sliceState);
});
