require('dotenv').config({path: 'variables.env'});
const jwt = require('jsonwebtoken');

const createServer = require('./src/createServer');
const db = require('./src/db');

const server = createServer();

// Use express middleware to handle cookies ( JWT )
// Use express middleware to populate current user
server.express.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const {userId} = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  details => {
    console.log(`Server running at: ${details.port}`);
  },
);
