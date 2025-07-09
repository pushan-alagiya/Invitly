/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseClient } from "@/api/ApiClient";
import { authEndPoint } from "@/utils/apiEndPoints";
import { createSlice } from "@reduxjs/toolkit";
import { store, updatePersistedReducer } from "../index";

interface IUserDetails {
  user: {
    id?: number;
    name?: string;
    email: string;
    phone?: string;
    role?: string;
    subscription_status?: string;
    status?: string;
    profile_picture?: string;
    permissioins?: any[];
  };
  token: string;
}

const AuthSlice = createSlice({
  name: "auth",
  initialState: {
    userDetails: null,
    rememberMe: false,
  } as {
    userDetails: IUserDetails | null;
    rememberMe: boolean;
  },
  reducers: {
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    setUserProfileImage: (state, action) => {
      if (state.userDetails && state.userDetails.user) {
        state.userDetails.user.profile_picture = action.payload;
      }
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    updateUserDetails: (state, action) => {
      if (state.userDetails) {
        state.userDetails.user = action.payload;
      }
    },
    logout: (state) => {
      state.userDetails = null;
    },
  },
});

export default AuthSlice.reducer;
export const {
  setUserDetails,
  setRememberMe,
  updateUserDetails,
  setUserProfileImage,
  logout,
} = AuthSlice.actions;

export const loginDetails = (payload: {
  email: string;
  password: string;
  rememberMe: boolean;
}) => {
  return async () => {
    try {
      const result: any = await BaseClient.post(authEndPoint.login, {
        email: payload.email,
        password: payload.password,
      });
      if (result?.status === 200) {
        store.dispatch(AuthSlice.actions.setRememberMe(payload.rememberMe));
        store.dispatch(AuthSlice.actions.setUserDetails(result?.data?.data));
      }
      if (result.data.data.token) {
        store.dispatch(AuthSlice.actions.setUserDetails(result?.data?.data));
      }
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
};

export const logoutUser = () => {
  return async (dispatch: any) => {
    try {
      dispatch(AuthSlice.actions.logout());
      updatePersistedReducer(false); // Ensure persistence is turned off after logout
    } catch (error) {
      console.log(error);
      return error;
    }
  };
};
