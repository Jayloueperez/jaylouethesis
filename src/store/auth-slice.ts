import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserInfo,
} from "firebase/auth";

import { auth, googleProvider } from "~/lib/firebase/client";
import {
  checkUser,
  checkUserExist,
  createUser,
  deleteUser as firestoreDeleteUser,
} from "~/lib/firebase/client/firestore";
import {
  googleAdditionalUserInfoSchema,
  LoginSchema,
  RegisterSchema,
} from "~/schema/auth";
import { UserRoleSchema } from "~/schema/data-base";
import { getError } from "~/utils/error";
import { generateKeywords } from "~/utils/string";

export const login = createAsyncThunk(
  "auth/login",
  async (params: LoginSchema & { role?: UserRoleSchema }, thunkApi) => {
    try {
      const { email, password, role } = params;

      if (role) await checkUser(email, role);

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await user.getIdToken();

      await fetch("/api/login", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      return user;
    } catch (error) {
      console.log("login error:", error);
      const err = getError(error);

      return thunkApi.rejectWithValue(err.message);
    }
  },
);

export const loginWithGoogle = createAsyncThunk(
  "auth/login-with-google",
  async (_params, thunkApi) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      if (!user.email) {
        const userDataExist = await checkUserExist(user.uid);

        if (userDataExist) await firestoreDeleteUser(user.uid);

        await signOut(auth);
        await deleteUser(user);

        return thunkApi.rejectWithValue("Email doesn't have an email.");
      }

      if (!user.email.endsWith("@bisu.edu.ph")) {
        const userDataExist = await checkUserExist(user.uid);

        if (userDataExist) await firestoreDeleteUser(user.uid);

        await signOut(auth);
        await deleteUser(user);

        return thunkApi.rejectWithValue(
          "Invalid email address. Must be a valid BISU email address.",
        );
      }

      const userDataExist = await checkUserExist(user.uid);

      if (!userDataExist) {
        const additionalUserInfo = await getAdditionalUserInfo(result);
        const { data, error } =
          googleAdditionalUserInfoSchema.safeParse(additionalUserInfo);

        if (error) console.log("loginWithGoogle error:", error);

        await createUser(user.uid, {
          email: user.email,
          firstName: data?.profile.firstName ?? "",
          middleInitial: "",
          surname: data?.profile.surname ?? "",
          gender: "",
          age: "",
          address: "",
          contact: "",
          course: "",
          section: "",
          year: "",
          role: "student",
          profile: user.photoURL ?? "",
          keywords: [
            ...generateKeywords(user.email),
            ...(data?.profile.firstName
              ? generateKeywords(data.profile.firstName)
              : []),
            ...(data?.profile.surname
              ? generateKeywords(data.profile.surname)
              : []),
          ],
          provider: "google",
          tokens: [],
          status: "confirmed",
          attachments: [],
          birthdate: "",
          talentsAssigned: [],
        });
      }

      const idToken = await user.getIdToken();

      await fetch("/api/login", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      return user;
    } catch (error) {
      console.log("loginWithGoogle error:", error);
      const err = getError(error);

      return thunkApi.rejectWithValue(err.message);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (params: RegisterSchema, thunkApi) => {
    try {
      const { email, password, ...rest } = params;

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await createUser(user.uid, {
        email,
        ...rest,
        role: "student",
        profile: "",
        provider: "email-password",
      });

      const idToken = await user.getIdToken();

      await fetch("/api/login", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      return user;
    } catch (error) {
      console.log("register error:", error);
      const err = getError(error);

      return thunkApi.rejectWithValue(err.message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_p, thunkApi) => {
  try {
    await signOut(auth);

    await fetch("/api/logout");
  } catch (error) {
    console.log("logout error:", error);
    const err = getError(error);

    return thunkApi.rejectWithValue(err.message);
  }
});

export interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  error: SerializedError | null;
  status: "initial" | "fetching" | "fetched";
  type: "login" | "register" | "logout" | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  status: "initial",
  type: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.status = "fetched";
    },
    resetUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.status = "initial";
      state.type = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.status = "fetching";
        state.type = "login";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      });

    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.status = "fetching";
        state.type = "login";
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.error = action.error;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      });

    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.status = "fetching";
        state.type = "register";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.error;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      });

    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.status = "fetching";
        state.type = "logout";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.error;
        state.loading = false;
        state.status = "fetched";
        state.type = null;
      });
  },
});

export const { setUser, resetUser } = authSlice.actions;
export default authSlice.reducer;
