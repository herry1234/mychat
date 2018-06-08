import gql from 'graphql-tag';

const CREATE_GROUP_MUTATION = gql`
  mutation createGroup($name: String!, $userId: Int!, $userIds: [Int!]) {
      createGroup(name: $name, userId: $userId, userIds: $userIds) {
        id
        name
        users {
            id
        }
      }
  }
`;

export default CREATE_GROUP_MUTATION;