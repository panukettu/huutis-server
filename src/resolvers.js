const { forwardTo } = require("prisma-binding");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const resolvers = {
  Query: {
    product: forwardTo("db"),
    products: forwardTo("db"),
    events: forwardTo("db"),
    me: async (parent, args, context, info) => {
      if (!context.request.userId) {
        return null;
      }
      const userInfoes = await context.db.query.userInfoes(
        {
          where: { user: { id: context.request.userId } }
        },
        info
      );
      return userInfoes[0];
    }
  },
  Mutation: {
    login: async (parent, args, context, info) => {
      // check if user exists with email
      let users = await context.db.query.userInfoes(
        {
          where: { user: { email: args.user } }
        },
        info
      );
      // check if user exists with displayname
      if (!users.length) {
        users = await context.db.query.userInfoes(
          {
            where: { user: { displayName: args.user } }
          },
          info
        );
      }
      // throw error
      if (!users.length) {
        throw new Error("Käyttäjää ei löydy.");
      }
      const userinfo = users[0];
      console.log("USERINFO: ", userinfo);
      // check password
      const valid = await bcrypt.compare(args.password, userinfo.user.password);
      if (!valid) {
        throw new Error("Väärä salasana");
      }

      // sign a new jwt and set it to response
      const token = jwt.sign(
        { userId: userinfo.user.id },
        process.env.APP_SECRET
      );
      context.response.set("x-token", token);

      return userinfo;
    },
    register: async (parent, args, context, info) => {
      args.email = args.email.toLowerCase();
      const password = await bcrypt.hash(args.password, 10);
      const user = await context.db.mutation.createUser(
        {
          data: {
            ...args,
            password,
            permissions: { set: ["USER"] }
          }
        },
        info
      );

      // create a jwt token
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      context.response.set("x-token", token);
      return user;
    },
    createProduct: (parent, args, context, info) => {
      return context.db.mutation.createProduct({ data: args.data }, info);
    }
  }
};

module.exports = resolvers;
