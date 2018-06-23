import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import { GraphQLSchema } from "graphql";
import * as fs from "fs";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { createTypeormConnection } from "./utils/createTypeormConnections";
import * as Redis from "ioredis";
import { User } from "./entity/User";

const redis = new Redis();

redis.on('error', (error:any) => (error))

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`
    })
  });
  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    await User.update({ id: userId }, { confirmed: true });
    res.send("ok");
  });

  await createTypeormConnection();
  return server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
};
