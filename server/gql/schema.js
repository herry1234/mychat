// Apollo requires a list of strings written in GraphQL’s language to establish a Schema.

export const Schema = [
    // `type Query {
    //     testStr : String
    // }
    // schema {
    //     query: Query
    // }`,
    `scalar Date

    type Group {
        id: Int!
        name: String
        users: [User]!
        messages: [Message]
    }

    type User {
        id: Int!
        email: String!
        username: String
        messages: [Message]
        groups: [Group]
        friends: [User]
    }

    type Message {
        id: Int!
        to: Group!
        from : User!
        text: String!
        createdAt: Date!
    }

    type Query {
        user(email: String, id: Int): User

        message(groupId: Int, userId: Int): [Message]

        group(id: Int!): Group
    }
    type Mutation {
        createMessage(
            text: String!
            userId: Int!
            groupId: Int!
        ): Message

        createGroup(
            name: String!
            userIds: [Int]
            userId: Int
        ): Group

        deleteGroup(
            id: Int!
        ): Group

        leaveGroup(
            id: Int!
            userId: Int!
        ): Group

        updateGroup(
            id: Int!
            name: String
        ): Group
    }
    schema {
        query: Query
        mutation: Mutation
    }
    `
];
export default Schema;
