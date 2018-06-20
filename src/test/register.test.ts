import { request } from "graphql-request";
import { host } from "./constansts";
import { createTypeormConnection } from "../utils/createTypeormConnections";
import { User } from "../entity/User";

const email = "juan@reina.com";
const password = "lokjashdfasdf";

const mutation = `
mutation{
  register(email: "${email}", password: "${password}")
}
`;

beforeAll(async () => {
  await createTypeormConnection();
});

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

afterAll(() => setTimeout(() => process.exit(), 500));