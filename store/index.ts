// ** Toolkit imports
import { configureStore } from "@reduxjs/toolkit";

// ** Persist imports
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import createWebStorage from "redux-persist/es/storage/createWebStorage";

// ** Reducers
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import rootReducer from "./rootReducer";

export function createPersistStore() {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return {
      getItem() {
        return Promise.resolve(null);
      },
      setItem() {
        return Promise.resolve();
      },
      removeItem() {
        return Promise.resolve();
      },
    };
  }
  return createWebStorage("local");
}

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createPersistStore();

// ** Dynamic Persist Config
const createPersistConfig = (key: string, shouldPersist: boolean) => ({
  key,
  version: 1,
  storage,
  whitelist: shouldPersist ? ["auth"] : [],
});

const getPersistedReducer = (rememberMe: boolean) => {
  return persistReducer(createPersistConfig("root", rememberMe), rootReducer);
};

export const store = configureStore({
  reducer: getPersistedReducer(true), // Default to true, update later based on user choice
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ** Update Persisted Reducer Based on Remember Me
export const updatePersistedReducer = (rememberMe: boolean) => {
  store.replaceReducer(getPersistedReducer(rememberMe));
};
