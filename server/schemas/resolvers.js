const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

console.log("resolvers.js");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("books");

        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      console.log("addUser");
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      console.log("login");
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { user, bookId }, context) => {
      console.log("saveBook");
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $push: { books: { bookId, username: context.user.username } } },
          // { new: true, runValidators: true }
          { new: true }
        ).populate("books");

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, { user, bookId }, context) => {
      console.log("removeBook");
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            $pull: {
              savedBooks: { bookId },
            },
          },
          // { new: true, runValidators: true }
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

console.log("export resolvers");
module.exports = resolvers;
