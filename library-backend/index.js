const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const { GraphQLError } = require('graphql');


const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const User = require('./models/User')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

mongoose.set('debug', (query) => {
  console.log(`Mongoose query:`, query)
})

  const start = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
      })
      
      const schema = makeExecutableSchema({ typeDefs, resolvers })
      const serverCleanup = useServer({ schema }, wsServer)
  
    const server = new ApolloServer({
      schema,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ]
    })
  
    await server.start();
    console.log('Apollo Server started');

    const loggedWarnings = {}

    app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const auth = req ? req.headers.authorization : null
    
          if (auth && auth.startsWith("Bearer ")) {
            const token = auth.substring(7)
            try {
              const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
              const currentUser = await User.findById(decodedToken.id)
              return { currentUser };
            } catch (error) {
              if (error.name === "TokenExpiredError") {
                if (!loggedWarnings["TokenExpiredError"]) {
                  console.warn("Token expired. Please log in again.")
                  loggedWarnings["TokenExpiredError"] = true;
                }
              } else {
                if (!loggedWarnings["OtherTokenError"]) {
                  console.warn("Token verification failed:", error.message)
                  loggedWarnings["OtherTokenError"] = true;
                }
              }
            }
          }
          return {}
        },
      })
    )
  
  
    const PORT = 4000
  
    httpServer.listen(PORT, () => {
      console.log(`Server is now running on http://localhost:${PORT}`)
    })
  }
  
  start()