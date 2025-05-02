import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import { NewUserFormSchema } from "~/schema/form";
import { getError } from "~/utils/error";
import { auth2 } from ".";
import { createUser } from "./firestore";

export async function createCoach(data: NewUserFormSchema) {
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
      role: "coach",
      status: "confirmed",
      keywords: [],
      tokens: [],
      attachments: [],
      birthdate: "",
    });

    await signOut(auth2);

    return true;
  } catch (error) {
    console.log("createCoach error:", error);

    const err = getError(error, "Failed creating new coach account.");

    throw err;
  }
}
