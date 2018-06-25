import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { createTypeormConnection } from './../../utils/createTypeormConnections';
import { TestClient } from "../../utils/testClient";

let conn: Connection;
const email = "juan@hot.com";
const password = "12346";

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
  await conn.close();
});

describe("logout", () => {
  it("test logging out a user", async () => {
    const client = new TestClient();

    await client.login(email, password);

    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});