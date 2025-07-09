/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import AuthSlice from "./slices/auth";
import projectSlice from "./slices/project";
import eventSlice from "./slices/event";

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logout") {
    state = undefined;
    localStorage.clear();
  }
  return combineReducers({
    auth: AuthSlice,
    project: projectSlice,
    event: eventSlice,
  })(state, action);
};

export default rootReducer;
