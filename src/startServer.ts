import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import { resolvers } from "./resolvers";
import * as path from "path";
import { createTypeormConnection } from "./utils/createTypeormConnections";

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));
  const server = new GraphQLServer({ typeDefs, resolvers });
  await createTypeormConnection();
  return server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
};
