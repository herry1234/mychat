import { _ } from 'lodash';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';

import randomColor from 'randomcolor';

import Message from '../comp/message';
import GROUP_QUERY from '../gql/group';
import MessageInput from '../comp/message-input';
import CREATE_MESSAGE_MUTATION from '../gql/create-message';

const styles = StyleSheet.create({
  containers: {
    alignItems: 'stretch',
    backgroundColor: '#e5bbbb',
    flex: 1,
    flexDirection: 'column',
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  titleWrapper: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleImage: {
    marginRight: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

const fakeData = () =>
  _.times(10, i => ({
    color: randomColor(),
    isCurrentUser: i % 5 === 0,
    message: {
      id: i,
      createdAt: new Date().toISOString(),
      from: {
        username: `Username ${i}`,
      },
      text: `MSG ${i}`,
    },
  }));

class Messages extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state, navigate } = navigation;
    console.log('HW', state);
    const goToGroupDetails = navigate.bind(this, 'GroupDetails', {
      id: state.params.groupId,
      title: state.params.title,
    });

    return {
      headerTitle: (
        <TouchableOpacity
          style={styles.titleWrapper}
          onPress={goToGroupDetails}
        >
          <View style={styles.title}>
            <Image
              style={styles.titleImage}
              source={{ uri: 'https://reactjs.org/logo-og.png' }}
            />
            <Text>{state.params.title}</Text>
          </View>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    const usernameColors = {};
    if (props.group && props.group.users) {
      props.group.users.forEach(user => {
        usernameColors[user.username] = randomColor();
      });
    }
    this.state = {
      usernameColors,
    };
    this.renderItem = this.renderItem.bind(this);
    this.send = this.send.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const usernameColors = {};
    if (nextProps.group) {
      if (nextProps.group.users) {
        nextProps.group.users.forEach(user => {
          usernameColors[user.username] =
            this.state.usernameColors[user.username] || randomColor();
        });
      }
      //Unlike props, the Component state is an internal object that is not defined by outside values.
      this.setState({
        usernameColors,
      });
    }
  }
  send(text) {
    console.log('sending message', this.props.navigation.state.params.groupId);
    this.props
      .createMessage({
        groupId: this.props.navigation.state.params.groupId,
        userId: 1,
        text,
      })
      .then(() => {
        this.flatList.scrollToEnd({ animated: true });
      });
  }
  // keyExtractor = item => item.message.id.toString();
  keyExtractor = item => item.id.toString();
  // renderItem = ({ item: { isCurrentUser, message, color}}) => (
  //     <Message
  //     color={color}
  //     isCurrentUser={isCurrentUser}
  //     message={message}
  //     />
  // );
  renderItem = ({ item: message }) => (
    <Message
      color={this.state.usernameColors[message.from.username]}
      isCurrentUser={message.from.id === 1}
      message={message}
    />
  );

  render() {
    const { loading, group } = this.props;
    if (loading && !group) {
      return (
        <View style={[styles.loading, styles.containers]}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.containers}>
        <FlatList
          // data={fakeData()}
          ref={ref => {
            this.flatList = ref;
          }}
          data={group.messages.slice().reverse()}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListEmptyComponent={<View />}
        />
        <MessageInput send={this.send} />
      </View>
    );
  }
}

const groupQuery = graphql(GROUP_QUERY, {
  options: ownProps => ({
    variables: {
      groupId: ownProps.navigation.state.params.groupId,
      // groupId: 1,
    },
  }),
  props: ({ data: { loading, group } }) => ({
    loading,
    group,
  }),
});

const createMessageMutation = graphql(CREATE_MESSAGE_MUTATION, {
  props: ({ mutate }) => ({
    createMessage: ({ text, userId, groupId }) =>
      mutate({
        variables: { text, userId, groupId },
        update: (store, { data: { createMessage } }) => {
          const groupData = store.readQuery({
            query: GROUP_QUERY,
            variables: {
              groupId,
            },
          });
          groupData.group.messages.unshift(createMessage);
          store.writeQuery({
            query: GROUP_QUERY,
            variables: {
              groupId,
            },
            data: groupData,
          });
        },
      }),
  }),
});

export default compose(
  groupQuery,
  createMessageMutation,
)(Messages);

// export default Messages;
