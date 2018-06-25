import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConnection } from "./../../utils/createTypeormConnections";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/testClient";

const email = "juan@hot.com";
const password = "123456";


let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

const loginExpectError = async (client: TestClient, emailTemp: string, passwordTemp: string, errorMessage: string) => {
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
    const client = new TestClient();
    await loginExpectError(client, "jua@hot.com", "what__", invalidLogin);
  });

  it("Email not confirmed", async () => {
    const client = new TestClient();
    await client.register(email, password);

    await loginExpectError(client, email, password, confirmEmailError);
    await User.update({ email }, { confirmed: true });
    await loginExpectError(client, email, "0123456", invalidLogin);

    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });
});
