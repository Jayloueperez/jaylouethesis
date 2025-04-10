import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import { NewUserFormSchema } from "~/schema/form";
import { getError } from "~/utils/error";
import { auth2 } from ".";
import { createUser } from "./firestore";

export async function createFaculty(data: NewUserFormSchema) {
  try {
    const {
      email,
      password,
      /*eslint no-unused-vars: ["error", { "destructuredArrayIgnorePattern": "^_" }]*/
      confirmPassword: _confirmPassword,
      ...rest
    } = data;

    const { user } = await createUserWithEmailAndPassword(
      auth2,
      email,
      password,
    );

    await sendEmailVerification(user);
    await createUser(user.uid, {
      email,
      ...rest,
      gender: "",
      age: "",
      address: "",
      contact: "",
      course: "",
      year: "",
      section: "",
      profile: "",
      provider: "email-password",
      role: "faculty",
      status: "confirmed",
      keywords: [],
      tokens: [],
    });

    await signOut(auth2);

    return true;
  } catch (error) {
    console.log("createFaculty error:", error);

    const err = getError(error, "Failed creating new faculty account.");

    throw err;
  }
}
