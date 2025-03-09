import express from 'express';
import { setRoutes } from './routes/index';
import { connectMongoDB } from './utils/connect_mongodb';

import cors from 'cors';

const { createHandler } = require('graphql-http/lib/use/express');
import { schema, rootResolver } from './graphql/grapql_schema';


const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(cors());

app.use('/graphql', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log('GraphQL request received');
    next();
}, createHandler({ schema, rootValue: rootResolver }));// Set up routes
setRoutes(app);

// Connect to MongoDB
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});