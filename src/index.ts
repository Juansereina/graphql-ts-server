import "reflect-metadata";
import { GraphQLServer } from 'graphql-yoga';

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`

const resolvers = {
  Query: {
    hello: (_: any, second: any) => 'Hello'+ second.name
  },
}

const server = new GraphQLServer({ typeDefs, resolvers })
server.start(() => console.log('Server is running on localhost:4000'))