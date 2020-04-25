import express from 'express'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import config from './config'
import cors from 'cors'
import { signup, signin, protect } from './utils/auth'
import { connect } from './utils/db'
import userRouter from './resources/user/user.router'
import itemRouter from './resources/item/item.router'
import tripRouter from './resources/trip/trip.router'

const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')

import expressPlayground from 'graphql-playground-middleware-express'
import { execute, subscribe } from 'graphql'
import { createServer, Server } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'

const WS_PORT = 3030;

export const app = express()

app.disable('x-powered-by')

app.use('*', cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.post('/signup', signup)
app.post('/signin', signin)

app.use('/api', protect)
app.use('/api/user', userRouter)
app.use('/api/item', itemRouter)
app.use('/api/trip', tripRouter)

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.get('/', (req, res) => {
  res.redirect('/graphql');
});

const server = createServer(app);

server.listen(WS_PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${WS_PORT}`);
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onConnect () {
      console.log('Client connected')
    },
    onDisconnect () {
      console.log('Client disconnected')
    }    
  }, {
    server,
    path: '/subscriptions',
  })
});

export const start = async () => {
  try {
    await connect()
    app.listen(3000, () => console.log("Running on localhost: 3000"))
  } catch (e) {
    console.error(e)
  }
}

console.log(`GraphQL Server is now running on http://localhost:${WS_PORT}`);
console.log(`Subscriptions are running on ws://localhost:${WS_PORT}/subscriptions`);