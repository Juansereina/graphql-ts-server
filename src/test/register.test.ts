import { request } from "graphql-request";
import { getConnectionManager } from "typeorm";
import { User } from "../entity/User";
import { startServer } from "./../startServer";

let getHost: string;
let app: any;
beforeAll(async () => {
  app = await startServer();
  const { port } = app.address();
  getHost = `http://127.0.0.1:${port}`;
});

const email = "juan@reina.com";
const password = "lokjashdfasdf";

const mutation = `
mutation{
  register(email: "${email}", password: "${password}")
}
`;

test("Register user", async () => {
  try {
    const response = await request(getHost, mutation);
    expect(response).toEqual({ register: true });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  } catch (err) {
    console.log(err);
  }
});

afterAll(() => {
  getConnectionManager()
    .get()
    .close();
    app.close();
});
