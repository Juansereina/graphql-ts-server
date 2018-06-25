import axios from "axios";
import { User } from "../../entity/User";
import { Connection } from "typeorm";
import { createTypeormConnection } from './../../utils/createTypeormConnections';

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

const logoutMutation = `
mutation {
  logout
}
`;

describe("logout", () => {
  it("test logging out a user", async () => {
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

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
      },
      {
        withCredentials: true
      }
    );

    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );

    expect(response2.data.data.me).toBeNull();
  });
});