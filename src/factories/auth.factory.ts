import { faker } from "@faker-js/faker";
import { USER_PASSWORD } from "@config/env.config";
import type { LoginUserModel } from "@src/models/user.model";

/** Random unknown email with valid password shape — for negative login UI tests. */
export const createUnknownEmailUser = (): LoginUserModel => ({
  email: faker.internet.email(),
  password: USER_PASSWORD,
});
