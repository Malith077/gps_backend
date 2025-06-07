import http from 'http';
import express from 'express';
import cors from 'cors';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';    // ← updated import

import { typeDefs, resolvers } from './graphql/grapql_schema';
import { setRoutes } from './routes';
import { connectMongoDB } from './utils/connect_mongodb';

async function start() {
  const app = express();
  app.use(cors(), express.json());
  setRoutes(app);
  await connectMongoDB();

  const server = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // wire up graphql-ws on the same /graphql path
  const wsServer = new WebSocketServer({ server, path: '/graphql' });
  const cleanup = useServer({ schema }, wsServer);

  const apollo = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await cleanup.dispose();
            }
          };
        }
      }
    ]
  });
  await apollo.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apollo, { context: async () => ({}) })
  );

  const PORT = Number(process.env.PORT ?? 3002);
  server.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}/graphql`));
}

start().catch(console.error);
