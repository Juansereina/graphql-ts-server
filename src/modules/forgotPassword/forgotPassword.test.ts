import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";
import * as Redis from "ioredis";
import { createTypeormConnection } from "../../utils/createTypeormConnections";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";

let conn: Connection;
export const redis = new Redis();
const email = "juanse@hot.com";
const password = "0123456";
const newPassword = "nuevo12346";

let userId: string;
beforeAll(async () => {
  conn = await createTypeormConnection();
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

describe("Forgot password Test", () => {
  it("Make sure it works", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const url = await createForgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});