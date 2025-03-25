import { faker } from "@faker-js/faker";
import { differenceInYears } from "date-fns";

import { courses } from "~/const/courses";
import { UserRoleSchema } from "~/schema/data-base";
import { UserSchema } from "~/schema/data-client";

export const generateAddress = () =>
  [faker.location.county(), faker.location.city(), faker.location.state()].join(
    ", ",
  );

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomSportsClub = () =>
  [
    "Art Club",
    "Dance Club",
    "The Voice Club",
    "Basketball",
    "Volleyball",
    "Tennis",
  ][getRandomInt(0, 5)];

export const generateUsers = <
  T extends {
    [key: string]: unknown;
  },
>(
  count: number,
  role: UserRoleSchema,
  extra: T = Object.create({}),
): (UserSchema & T)[] =>
  Array.from({ length: count }).map(
    (_v, i) =>
      ({
        id: `student-${i}`,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        middleInitial: faker.person.middleName().charAt(0),
        surname: faker.person.lastName(),
        gender: (["male", "female"] as const)[getRandomInt(0, 1)],
        contact: faker.phone.number(),
        address: generateAddress(),
        age: differenceInYears(faker.date.birthdate(), new Date()).toString(),
        course: courses[getRandomInt(0, 5)],
        year: ["1", "2", "3", "4"][getRandomInt(0, 3)],
        section: ["A", "B", "C", "D"][getRandomInt(0, 3)],
        profile: faker.image.avatar(),
        role: "student",
        keywords: [],
        provider: "email-password",
        dateCreated: new Date(),
        dateUpdated: new Date(),
        tokens: [],
        status: "pending",
        ...extra,
      }) satisfies UserSchema,
  );
