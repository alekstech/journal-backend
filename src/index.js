const jwt = require('jsonwebtoken');

require('dotenv').config()

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// get auth token from headers
server.express.use((req, res, next) => {
  const { token } = req.headers;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next();
});


// populates the user on each request
server.express.use(async (req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) return next();
  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, email, name }'
  );
  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: function (origin, callback) {
        const allowed = process.env.FRONTEND_URL.split(',')
        if (!origin || allowed.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error(`${origin} not allowed by CORS`))
        }
      }
    },
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
