import { createSlice } from "@reduxjs/toolkit";

interface EventState {
  eventChanged: boolean;
}

const initialState: EventState = {
  eventChanged: false,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    eventChange(state) {
      state.eventChanged = true;
    },
    resetEvent(state) {
      state.eventChanged = false;
    },
  },
});

export const { eventChange, resetEvent } = eventSlice.actions;

export default eventSlice.reducer;
