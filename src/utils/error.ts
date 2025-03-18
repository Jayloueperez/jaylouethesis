import { FirebaseError } from "firebase/app";
import _ from "lodash";
import { ZodError } from "zod";

export const FIREBASE_SERVICE_REGEX = /(app|auth|firestore|storage)\//g;

export const getFirebaseError = (
  error: FirebaseError | Error,
  errorMessage: string,
) => {
  if ("code" in error) {
    switch (error.code) {
      case "auth/email-already-exists":
        return new Error("Email already exist.");

      case "auth/invalid-credential":
        return new Error("Invalid email or password.");

      case "auth/too-many-requests":
        return new Error("Maximum sign in attempts exceeded.");

      default:
        return new Error(
          `${_.capitalize(
            error.code.replaceAll(FIREBASE_SERVICE_REGEX, "").replace("-", " "),
          ).trim()}.` || errorMessage,
        );
    }
  } else {
    return new Error(error.message);
  }
};

export const getError = (error: unknown, message?: string) => {
  const errorMessage = message ?? "An unknown error occured.";
  console.log(error instanceof FirebaseError);

  if (error instanceof FirebaseError)
    return getFirebaseError(error, errorMessage);
  else if (error instanceof ZodError)
    return new Error(error.issues[0].message || errorMessage);
  else if (error instanceof Error) return getFirebaseError(error, errorMessage);
  else if (
    error instanceof Object &&
    "message" in error &&
    typeof error.message === "string"
  )
    return new Error(error.message);
  else if (typeof error === "string") return new Error(error || errorMessage);
  else return new Error(errorMessage);
};
