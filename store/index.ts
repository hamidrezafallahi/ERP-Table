import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import {
  Action,
  configureStore,
  Middleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import ServiceRootReducer from "@services/index";
import sliceRootReducer from "@slice/index";
import { createConfigSyncMiddleware } from "@store/middleware/syncConfigMiddleware";

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
  middleware: (getDefaultMiddleware): Middleware[] =>
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
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

AppReduxStore.subscribe(() => {
  const state = AppReduxStore.getState();
  const sliceState = { ...state.withPersist, ...state.withoutPersist };
  console.log("currentState", sliceState);
});
