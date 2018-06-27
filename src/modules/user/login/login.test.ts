import { Connection } from "typeorm";
import * as faker from "faker";

import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../../entity/User";
import { createTypeormConnection } from ".././../../utils/createTypeormConnections";
import { TestClient } from "../../../utils/testClient";

faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.password();
const client = new TestClient();

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

const loginExpectError = async (
  emailTemp: string,
  passwordTemp: string,
  errorMessage: string
) => {
  const response = await client.login(emailTemp, passwordTemp);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errorMessage
      }
    ]
  });
};

describe("Login Tests", () => {
  it("Email not found send back error", async () => {
    await loginExpectError(
      faker.internet.email(),
      faker.internet.password(),
      invalidLogin
    );
  });

  it("Email not confirmed", async () => {
    await client.register(email, password);
    await loginExpectError(email, password, confirmEmailError);
    await User.update({ email }, { confirmed: true });
    await loginExpectError(email, faker.internet.password(), invalidLogin);

    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });
});
