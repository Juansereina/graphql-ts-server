import * as bcrypt from 'bcryptjs';
import { ResolverMap } from "../../types/graphql-utils";
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query:{
    bye: () => "bye"
  },
  Mutation: {
    register: async (_, {email, password}): Promise<any> => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        email,
        password: hashedPassword
      });
      return newUser.save();
    }
  }
};
