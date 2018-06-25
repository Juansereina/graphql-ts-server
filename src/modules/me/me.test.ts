import { createTypeormConnection } from "./../../utils/createTypeormConnections";
import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { TestClient } from "../../utils/testClient";

let userId: string;
let conn: Connection;
const email = "juan@hot.com";
const password = "123456";

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
