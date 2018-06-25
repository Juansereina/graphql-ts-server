import axios from "axios";
import { createTypeormConnection } from "./../../utils/createTypeormConnections";
import { User } from "../../entity/User";
import { Connection } from "typeorm";

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
  conn.close();
});

const loginMutation = (emailMutation: string, passwordMutation: string) => `
mutation {
  login(email: "${emailMutation}", password: "${passwordMutation}") {
    path
    message
  }
}
`;

const meQuery = `
{
  me {
    id
    email
  }
}
`;

describe("Me test", () => {
  it("Return null if no cookie", async () => {
    const response = await axios.post(process.env.TEST_HOST as string, {
      query: meQuery
    });
    expect(response.data.data.me).toBeNull();
  });
  it("Get current user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );
    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );
    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
