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
  it("Logout multiple sessions", async () => {
    const sess1 = new TestClient();
    const sess2 = new TestClient();
    await sess1.login(email, password);
    await sess2.login(email, password);
    expect(await sess1.me()).toEqual(await sess2.me());
    await sess1.logout();
    expect(await sess1.me()).toEqual(await sess2.me());
  });

it("Logout single session", async () => {
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