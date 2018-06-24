import * as Redis from "ioredis";
import fetch from "node-fetch";
import { createTypeormConnection } from "./createTypeormConnections";
import { User } from "./../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";

let userId: string;
const redis = new Redis();

beforeAll(async () => {
  await createTypeormConnection();
  const user = await User.create({
    email: "juan@hotmail.com",
    password: "123456789"
  }).save();
  userId = user.id;
});

describe("Test createConfirmEmailLink", () => {
  it("Make sure it confirms user and clears key in redis", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId,
      redis
    );
    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).confirmed).toBeTruthy();
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
  it("send invalid back if bad id sent", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/1234`);
    const text = await response.text();
    expect(text).toEqual("invalid");
  });
});
