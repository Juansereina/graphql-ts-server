import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import { createTypeormConnection } from "./utils/createTypeormConnections";
import { GraphQLSchema } from "graphql";
import * as fs from 'fs';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';


export let connection: any;

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, './modules'));
  folders.forEach( folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }))
  });
  const server = new GraphQLServer({schema: mergeSchemas({schemas})});
  connection = await createTypeormConnection();
  return server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
};