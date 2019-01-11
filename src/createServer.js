const { GraphQLServer } = require("graphql-yoga");
const resolvers = require("./resolvers");
const db = require("./db");

// Create a Yoga Server

function createServer() {
  return new GraphQLServer({
    typeDefs: "src/typeDefs.graphql",
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    context: req => ({ ...req, db })
  });
}

module.exports = createServer;
