import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { User } from "../../entity/User";
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
  duplicateEmail
} from "./errorMessages";

let getHost: string;
let app: any;
beforeAll(async () => {
  app = await startServer();
  const { port } = app.address();
  getHost = `http://127.0.0.1:${port}`;
});

const email = "juan@hotmail.com";
const password = "123456789";

const mutation = (mutationEmail: string, mutationPassword: string) => `
mutation{
  register(email: "${mutationEmail}", password: "${mutationPassword}"){
    path
    message
  }
}
`;

describe("Register user", () => {
  it("Make sure we can register a user", async () => {
    const response = await request(getHost, mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });
  it("Test for duplicate emails", async () => {
    const response: any = await request(getHost, mutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });
  it("Catch bad email", async () => {
    const response: any = await request(getHost, mutation("ju", password));
    expect(response).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        }
      ]
    });
  });

  it("Catch bad password", async () => {
    const response = await request(getHost, mutation(email, "ju"));
    expect(response).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it("Catch bad password and bad email", async () => {
    const response: any = await request(getHost, mutation("df", "ad"));
    expect(response).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        },
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
