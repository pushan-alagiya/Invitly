import { createSlice } from "@reduxjs/toolkit";

interface ProjectState {
  projectChanged: boolean;
}

const initialState: ProjectState = {
  projectChanged: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    projectChange(state) {
      state.projectChanged = true;
    },
    resetProject(state) {
      state.projectChanged = false;
    },
  },
});

export const { projectChange, resetProject } = projectSlice.actions;

export default projectSlice.reducer;
