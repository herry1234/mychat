import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { graphql, compose } from 'react-apollo';
import { StackActions, NavigationActions } from 'react-navigation';

import GROUP_QUERY from '../gql/group';
import USER_QUERY from '../gql/user';
import DELETE_GROUP_MUTATION from '../gql/delete-group';
import LEAVE_GROUP_MUTATION from '../gql/leave-group';

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Main' })],
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImageContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 6,
    alignItems: 'center',
  },
  groupName: {
    color: 'black',
  },
  groupNameBorder: {
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    borderTopWidth: 1,
    flex: 1,
    paddingVertical: 8,
  },
  groupImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  participants: {
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#dbdbdb',
    color: '#777',
  },
  user: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    flexDirection: 'row',
    padding: 10,
  },
  username: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

class GroupDetails extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
  });
  constructor(props) {
    super(props);

    this.deleteGroup = this.deleteGroup.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  deleteGroup() {
    this.props
      .deleteGroup(this.props.navigation.state.params.id)
      .then(() => {
        this.props.navigation.dispatch(resetAction);
      })
      .catch(e => {
        console.log(e);
      });
  }
  leaveGroup() {
    this.props
      .leaveGroup({
        id: this.props.navigation.state.params.id,
        userId: 1,
      })
      .then(() => {
        this.props.navigation.dispatch(resetAction);
      })
      .catch(e => {
        console.log(e);
      });
  }

  keyExtractor = item => item.id.toString();
  renderItem = ({ item: user }) => (
    <View style={styles.user}>
      <Image
        style={styles.avatar}
        source={{ uri: 'https://reactjs.org/logo-ng.png' }}
      />
      <Text style={styles.username}> {user.username}</Text>
    </View>
  );

  render() {
    const { group, loading } = this.props;
    if (!group || loading) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={group.users}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListHeaderComponent={() => (
            <View>
              <View style={styles.detailsContainer}>
                <TouchableOpacity
                  style={styles.groupImageContainer}
                  onPress={this.pickGroupImage}
                >
                  <Image
                    style={styles.groupImage}
                    source={{ uri: 'https://reactjs.org/logo-og.png' }}
                  />
                </TouchableOpacity>
                <View style={styles.groupNameBorder}>
                  <Text style={styles.groupName}>{group.groupName}</Text>
                </View>
              </View>
              <Text style={styles.participants}>
                {`participants: ${group.users.length}`.toUpperCase()}
              </Text>
            </View>
          )}
          ListFooterComponent={() => (
            <View>
              <Button title="leave group" onPress={this.leaveGroup} />
              <Button title="delete group" onPress={this.deleteGroup} />
            </View>
          )}
        />
      </View>
    );
  }
}

const groupQuery = graphql(GROUP_QUERY, {
  options: ownProps => ({
    variables: { groupId: ownProps.navigation.state.params.id },
  }),
  props: ({ data: { loading, group } }) => ({
    loading,
    group,
  }),
});

const deleteGroupMutation = graphql(DELETE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    deleteGroup: id =>
      mutate({
        variables: { id },
        update: (store, { data: { deleteGroup } }) => {
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: 1 },
          });
          data.user.groups = data.user.groups.filter(
            g => deleteGroup.id !== g.id,
          );
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: 1 },
            data,
          });
        },
      }),
  }),
});

const leaveGroupMutation = graphql(LEAVE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    leaveGroup: ({ id, userId }) =>
      mutate({
        variables: { id, userId },
        update: (store, { data: { leaveGroup } }) => {
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: 1 },
          });
          data.user.groups = data.user.groups.filter(
            g => leaveGroup.id !== g.id,
          );
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: 1 },
            data,
          });
        },
      }),
  }),
});

export default compose(
  groupQuery,
  deleteGroupMutation,
  leaveGroupMutation,
)(GroupDetails);
