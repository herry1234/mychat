import { _ } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  FlatList,
  Button,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { graphql } from 'react-apollo';
import { USER_QUERY } from '../gql/user';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  groupContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  groupName: {
    fontWeight: 'bold',
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    padding: 6,
    borderColor: '#eee',
    borderBottomWidth: 1,
  },
  warning: {
    textAlign: 'center',
    padding: 12,
  },
});


const fakeData = () =>
  _.times(20, i => ({
    id: i,
    name: `Group #${i}`,
  }));

class MyGroup extends Component {
  constructor(props) {
    super(props);
    this.goToMessages = this.props.goToMessages.bind(this, this.props.group);
  }
  render() {
    const { id, name } = this.props.group;
    return (
      <TouchableHighlight key={id} onPress={this.goToMessages}>
        <View style={styles.groupContainer}>
          <Text style={styles.groupName}>{`${name}`}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

MyGroup.propTypes = {
  goToMessages: PropTypes.func.isRequired,
  group: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
};
const Header = ({ onPress }) => (
  <View style={styles.header}>
    <Button title={'New group'} onPress={onPress} />
  </View>
);
class Groups extends Component {
  static navigationOptions = {
    title: 'Chats',
  };
  constructor(props) {
    super(props);
    this.goToNewGroup = this.goToNewGroup.bind(this);
    this.goToMessages = this.goToMessages.bind(this);
  }
  goToMessages(group) {
    console.log('HERRY', this.props);
    const { navigate } = this.props.navigation; //const navigate = this.props.navigation.navigate
    navigate('Messages', { groupId: group.id, title: group.name });
  };
  goToNewGroup() {
    const { navigate } = this.props.navigation;
    navigate('NewGroup');
  }
  renderItem = ({ item }) => {
    return <MyGroup group={item} goToMessages={this.goToMessages} />;
  };
  keyExtractor = item => item.id.toString();

  render() {
    const { loading, user } = this.props;

    if (loading) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    if (user && !user.groups.length) {
      return (
        <View style={styles.container}>
          <Header onPress={this.goToNewGroup} />
          <Text style={styles.warning}>{'You dont have any group'}</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <FlatList
          //   data={fakeData()}
          data={user.groups}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListHeaderComponent={() => <Header onPress={this.goToNewGroup} />} 
        />
      </View>
    );
  }
}

const userQuery = graphql(USER_QUERY, {
  options: () => ({ variables: { id: 1 } }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user,
  }),
});

export default userQuery(Groups);
