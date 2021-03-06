import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import * as yup from "yup";
import { formatYupError } from "../../../utils/formatYupError";
import {
  emailNotLongEnough,
  invalidEmail,
  duplicateEmail
} from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
// import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
// import { sendEmail } from "../../utils/sendEmail";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
    password: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments
      // { redis, url }: any
    ): Promise<any> => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      const { email, password } = args;
      const userAlreadyExist = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExist) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      const newUser = User.create({
        email,
        password
      });
      await newUser.save();
      // await createConfirmEmailLink(url, newUser.id, redis);
      // if(process.env.NODE_ENV !== 'test'){
      //   sendEmail(email, link);
      // }
      return null;
    }
  }
};
