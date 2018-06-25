import { request } from "graphql-request";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../entity/User";
import { createTypeormConnection } from "./../../utils/createTypeormConnections";
import { Connection } from "typeorm";

const email = "juan@hot.com";
const password = "123456";

const registerMutation = (emailMutation: string, passwordMutation: string) => `
mutation {
  register(email: "${emailMutation}", password: "${passwordMutation}") {
    path
    message
  }
}
`;

const loginMutation = (emailMutation: string, passwordMutation: string) => `
mutation {
  login(email: "${emailMutation}", password: "${passwordMutation}") {
    path
    message
  }
}
`;

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

const loginExpectError = async (emailTemp: string, passwordTemp: string, errorMessage: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(emailTemp, passwordTemp)
  );

  expect(response).toEqual({
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
    await loginExpectError("jua@hot.com", "what__", invalidLogin);
  });

  it("Email not confirmed", async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );
    await loginExpectError(email, password, confirmEmailError);
    await User.update({ email }, { confirmed: true });
    await loginExpectError(email, "0123456", invalidLogin);

    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );

    expect(response).toEqual({ login: null });
  });
});
