import express from 'express';
import { setRoutes } from './routes/index';
import { connectMongoDB } from './utils/connect_mongodb';

import cors from 'cors';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs, resolvers } from './graphql/grapql_schema';

const app = express();
const PORT = process.env.PORT || 3002;

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Middleware
app.use(express.json());
app.use(cors());


// Connect to MongoDB
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function startApolloServer() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });
    console.log(`🚀 Apollo Server ready at ${url}`);
}

startApolloServer();