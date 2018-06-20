import { ResolverMap } from "./types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }): string => `Hello ${name || "World"}`
  },
  Mutation: {
    register: (_, args): GQL.IRegisterOnMutationArguments => args
  }
};
