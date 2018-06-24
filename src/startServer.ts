import { GraphQLServer } from "graphql-yoga";
import { redis } from "./redis";
import { createTypeormConnection } from "./utils/createTypeormConnections";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`
    })
  });
  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConnection();
  return server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
};
