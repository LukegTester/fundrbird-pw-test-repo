import { USER_EMAIL, USER_PASSWORD } from "@config/env.config";
import type { LoginUserModel } from "@src/models/user.model";

export const demoUser: LoginUserModel = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
};

export const wrongPasswordUser: LoginUserModel = {
  email: USER_EMAIL,
  password: "wrongpassword",
};

export const unknownEmailUser: LoginUserModel = {
  email: "wrong@example.com",
  password: USER_PASSWORD,
};
