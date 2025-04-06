import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import { NewUserFormSchema } from "~/schema/form";
import { getError } from "~/utils/error";
import { auth2 } from ".";
import { createUser } from "./firestore";

export async function createTeacher(data: NewUserFormSchema) {
  try {
    const {
      email,
      password,
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
      role: "teacher",
      status: "confirmed",
      keywords: [],
      tokens: [],
    });

    await signOut(auth2);

    return true;
  } catch (error) {
    console.log("createTeacher error:", error);

    const err = getError(error, "Failed creating new teacher account.");

    throw err;
  }
}
