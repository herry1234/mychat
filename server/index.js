import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Schema } from './gql/schema';
import { Mocks } from './gql/mock';
import { Resolvers } from './gql/resolvers';

// const PORT = 8000;
const GQLPORT = 8000;
const app = express();
const executableSchema = makeExecutableSchema({
    typeDefs: Schema,
    resolvers: Resolvers,
});
// addMockFunctionsToSchema({
//     schema: executableSchema,
//     mocks: Mocks,
//     preserveResolvers: true,
// });
app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
}));
app.use('/graphql', bodyParser.json(), graphqlExpress({
    schema: executableSchema,
    context: {},
}));
// app.listen(PORT, () => console.log(`server listen on port ${PORT}`));
const graphQlServer = createServer(app);
graphQlServer.listen(GQLPORT, () => console.log('GQL server listening on port ', GQLPORT));
