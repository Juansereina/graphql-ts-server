import * as bcrypt from 'bcryptjs';
import { ResolverMap } from "../../types/graphql-utils";
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query:{
    bye: () => "bye"
  },
  Mutation: {
    register: async (_, {email, password}): Promise<any> => {

      const userAlreadyExist = await User.findOne({
        where: { email },
        select: ['id']
      });
      if(userAlreadyExist){
        return[
          {
            path:'email',
            message:'Email already taken'
          }
        ]
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        email,
        password: hashedPassword
      });
      newUser.save();
      return null;
      
    }
  }
};
