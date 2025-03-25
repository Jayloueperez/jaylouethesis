import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { UserSchema } from "~/schema/data-client";

export interface UserState {
  userData: UserSchema | null;
  loading: boolean;
  error: Error | null;
  status: "initial" | "fetching" | "fetched";
}

const initialState: UserState = {
  userData: null,
  loading: false,
  error: null,
  status: "initial",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserSchema | null>) => {
      state.userData = action.payload;
      state.status = "fetched";
    },
    resetUserData: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
      state.status = "initial";
    },
  },
});

export const { setUserData, resetUserData } = userSlice.actions;
export default userSlice.reducer;
