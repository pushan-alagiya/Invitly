/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseClient } from "@/api/ApiClient";
import { authEndPoint } from "@/utils/apiEndPoints";
import { createSlice } from "@reduxjs/toolkit";
import { store, updatePersistedReducer } from "../index";

interface IPermission {
  resource: string;
  action: string;
  description: string;
}

interface IUserDetails {
  user: {
    id?: number;
    name?: string;
    email: string;
    phone_number?: string;
    roles?: (string | { id: number; role_name: string; is_premium: boolean })[];
    permissions?: IPermission[];
    status?: string;
    profile_picture?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    office_phone?: string;
    company_id?: number;
    channel_id?: number;
    is_verified?: boolean;
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
        state.userDetails.user = {
          ...state.userDetails.user,
          ...action.payload,
        };
      }
    },
    updateUserPermissions: (state, action) => {
      if (state.userDetails && state.userDetails.user) {
        state.userDetails.user.permissions = action.payload;
      }
    },
    updateUserRoles: (state, action) => {
      if (state.userDetails && state.userDetails.user) {
        state.userDetails.user.roles = action.payload;
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
  updateUserPermissions,
  updateUserRoles,
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
      // Check for successful response (backend returns code: 200, not status: 200)
      if (result?.status === 200 && result?.data?.code === 200) {
        store.dispatch(AuthSlice.actions.setRememberMe(payload.rememberMe));
        store.dispatch(AuthSlice.actions.setUserDetails(result?.data?.data));
      }
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
};

export const registerUser = (payload: {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  office_phone?: string;
  company_id?: number;
  channel_id?: number;
}) => {
  return async () => {
    try {
      const result: any = await BaseClient.post(authEndPoint.register, payload);
      // Check for successful response (backend returns code: 200, not status: 200)
      if (result?.status === 200 && result?.data?.code === 200) {
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
