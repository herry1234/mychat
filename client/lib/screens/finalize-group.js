import { _ } from 'lodash';
import React, { Component } from 'react';
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import { StackActions, NavigationActions } from 'react-navigation';
import update from 'immutability-helper';

import { USER_QUERY } from '../gql/user';
import CREATE_GROUP_MUTATION from '../gql/create-group';
import SelectedUserList from '../comp/selected-user-list';

const goToNewGroup = group =>
StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: 'Main' }),
      NavigationActions.navigate({ routeName: 'Messages', params:{groupId: group.id, title: group.name} }),
    ],
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailsContainer: {
    padding: 20,
    flexDirection: 'row',
  },
  imageContainer: {
    paddingRight: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  input: {
    color: 'black',
    height: 32,
  },
  inputBorder: {
    borderColor: '#dbdbdb',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  inputInstruction: {
    paddingTop: 6,
    color: '#777',
    fontSize: 12,
  },
  groupImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  selected: {
    flexDirection: 'row',
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    color: 'blue',
    fontSize: 18,
    paddingTop: 2,
  },
  participants: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#dbdbdb',
    color: '#777',
  },
});

class FinalizeGroup extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    const isReady = state.params && state.params.mode === 'ready';
    return {
      title: 'new group',
      headerRight: isReady ? (
        <Button title="create" onPress={state.params.create} />
      ) : (
        undefined
      ),
    };
  };
  constructor(props) {
    super(props);
    const { selected } = props.navigation.state.params;
    this.state = {
      selected,
    };

    this.create = this.create.bind(this);
    this.pop = this.pop.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentDidMount() {
    this.refreashNavigation(this.state.selected.length && this.state.name);
  }

//   componentWillMount(nextPros, nextState) {
//     if (
//       (nextState.selected.length && nextState.name) !==
//       (this.state.selected.length && this.state.name)
//     ) {
//       this.refreashNavigation(nextState.selected.length && nextState.name);
//     }
//   }
  componentWillUpdate(nextPros, nextState) {
    if (
      (nextState.selected.length && nextState.name) !==
      (this.state.selected.length && this.state.name)
    ) {
      this.refreashNavigation(nextState.selected.length && nextState.name);
    }
  }

  pop() {
    this.props.navigation.goBack();
  }

  remove(user) {
    const i = this.state.selected.indexOf(user);
    if (~i) {
      const selected = update(this.state.selected, {
        $splice: [[i, 1]],
      });
      this.setState({
        selected,
      });
    }
  }
  create() {
    const { createGroup } = this.props;
    createGroup({
      name: this.state.name,
      userId: 1,
      userIds: _.map(this.state.selected, 'id'),
    })
      .then(res => {
        this.props.navigation.dispatch(goToNewGroup(res.data.createGroup));
      })
      .catch(error => {
        Alert.alert('Error creating new group', error.message, [
          { text: 'OK', onPress: () => {} },
        ]);
      });
  }

  refreashNavigation(ready) {
    const { navigation } = this.props;
    navigation.setParams({
      mode: ready ? 'ready' : undefined,
      create: this.create,
    });
  }

  render() {
    const { friendCount } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <View style={styles.detailsContainer}>
          <TouchableOpacity style={styles.imageContainer}>
            <Image
              style={styles.groupImage}
              source={{ uri: 'https://reactjs.org/logo-og.png' }}
            />
            <Text>edit</Text>
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <View style={styles.inputBorder}>
              <TextInput
                autoFocus
                onChangeText={name => this.setState({ name })}
                placeholder="Group Name"
                style={styles.input}
              />
            </View>
            <Text style={styles.inputInstruction}>
              {'pls give a group name'}
            </Text>
          </View>
        </View>

        <Text style={styles.participants}>
          {`who attend: ${this.state.selected.length} of ${friendCount}`}
        </Text>
        <View style={styles.selected}>
          {this.state.selected.length ? (
            <SelectedUserList data={this.state.selected} remove={this.remove} />
          ) : (
            undefined
          )}
        </View>
      </View>
    );
  }
}

const createGroupMutation = graphql(CREATE_GROUP_MUTATION, {
  props: ({ mutate }) => ({
    createGroup: ({ name, userId, userIds }) =>
      mutate({
        variables: { name, userId, userIds },
        update: (store, { data: { createGroup } }) => {
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: userId },
          });
          data.user.groups.push(createGroup);
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: userId },
            data,
          });
        },
      }),
  }),
});

const userQuery = graphql(USER_QUERY, {
  options: ownProps => ({
    variables: {
      id: ownProps.navigation.state.params.userId,
    },
  }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user,
  }),
});

export default compose(userQuery, createGroupMutation)(FinalizeGroup);
