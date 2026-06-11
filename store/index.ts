import {
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  createStateSyncMiddleware,
  initMessageListener,
} from 'redux-state-sync';

import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import ServiceRootReducer from '@services/index';
import sliceRootReducer from '@slice/index';

const { serviceMiddleware, serviceReducer } = ServiceRootReducer();

const persistConfig = {
  key: "arianERP",
  version: 1,
  storage,
};

const persistorReducer = persistReducer(
  persistConfig,
  sliceRootReducer.withPersist
);

let middlewares: any[] = [serviceMiddleware];

if (typeof window !== "undefined") {
  const syncMiddleware = createStateSyncMiddleware({
    predicate: (action) =>
      action.type.startsWith("config/") ||
      action.type.startsWith("pages/")
  });

  middlewares.push(syncMiddleware);
}


const AppReduxStore = configureStore({
  reducer: {
    ...serviceReducer,
    withoutPersist: sliceRootReducer.withoutPersist,
    withPersist: persistorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/PURGE"],
      },
    }).concat(...middlewares),
});
AppReduxStore.subscribe(() => {
  const state = AppReduxStore.getState();
  const sliceState = { ...state.withPersist, ...state.withoutPersist };
  console.log("currentState", sliceState);
});

if (typeof window !== "undefined") {
  initMessageListener(AppReduxStore);
}
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
