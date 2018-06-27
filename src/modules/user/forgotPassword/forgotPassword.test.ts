import * as Redis from "ioredis";
import { Connection } from "typeorm";
import * as faker from "faker";

import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { forgotPasswordLockedError } from "../login/errorMessages";
import { passwordNotLongEnough } from "../register/errorMessages";
import { expiredKeyError } from "./errorMessages";
import { createTestConn } from "../../../test/createTestConnection";

let conn: Connection;
const redis = new Redis();
faker.seed(Date.now() + 0);
const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = faker.internet.password();

let userId: string;
beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe("Forgot password", () => {
  it("Make sure it works", async () => {
    const client = new TestClient();

    await forgotPasswordLockAccount(userId, redis);
    const url = await createForgotPasswordLink("", userId, redis);

    const parts = url.split("/");
    const key = parts[parts.length - 1];

    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: "email",
            message: forgotPasswordLockedError
          }
        ]
      }
    });

    expect(await client.forgotPasswordChange("j", key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "newPassword",
            message: passwordNotLongEnough
          }
        ]
      }
    });

    const response = await client.forgotPasswordChange(newPassword, key);

    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    expect(await client.forgotPasswordChange(faker.internet.password(), key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: "key",
            message: expiredKeyError
          }
        ]
      }
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});