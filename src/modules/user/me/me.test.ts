import { Connection } from "typeorm";
import * as faker from "faker";

import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/testClient";
import { createTestConn } from "../../../test/createTestConnection";

let userId: string;
let conn: Connection;
faker.seed(Date.now() + 3);
const email = faker.internet.email();
const password = faker.internet.password();

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
  await conn.close();
});

describe("Me test", () => {
  it("Return null if no cookie", async () => {
    const client = new TestClient();
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });
  it("Get current user", async () => {
    const client = new TestClient();
    await client.login(email, password);
    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
