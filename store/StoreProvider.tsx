"use client";

import { persistor, store } from "../store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { Suspense } from "react";
import Loader from "@/components/loader";
import { ReactNode } from "react";

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Suspense
          fallback={
            <div className="h-screen flex justify-center items-center w-full">
              <Loader />
            </div>
          }
        >
          {children}
        </Suspense>
      </PersistGate>
    </Provider>
  );
};
