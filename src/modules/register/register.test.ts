import { User } from "../../entity/User";
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
  duplicateEmail
} from "./errorMessages";
import { createTypeormConnection } from "../../utils/createTypeormConnections";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/testClient";

const email = "juan@hotmail.com";
const password = "123456789";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConnection();
});

afterAll(async () => {
  await conn.close();
});

describe("Register user", () => {
  it("Make sure we can register a user", async () => {
    const client = new TestClient();
    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });
  it("Test for duplicate emails", async () => {
    const client = new TestClient();
    const response = await client.register(email, password);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });
  it("Catch bad email", async () => {
    const client = new TestClient();
    const response = await client.register("ju", password);
    expect(response.data).toEqual({
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
    const client = new TestClient();
    const response = await client.register(email, "as");
    expect(response.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it("Catch bad password and bad email", async () => {
    const client = new TestClient();
    const response = await client.register("df", "ad");
    expect(response.data).toEqual({
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
