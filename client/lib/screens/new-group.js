import { _ } from 'lodash';
import React, { Component } from 'react';
import {
  FlatList,
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';
import Icon from 'react-native-vector-icons/FontAwesome';

import SelectedUserList from '../comp/selected-user-list';
import USER_QUERY from '../gql/user';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  cellContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cellImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cellLabel: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seleted: {
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
  checkBouttonContainer: {
    paddingRight: 12,
    paddingVertical: 6,
  },
  checkButton: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    padding: 4,
    height: 24,
    width: 24,
  },
  checkButtonIcon: {
    marginRight: -4,
  },
});

class Cell extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isSelected: props.isSelected(props.item),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isSelected: nextProps.isSelected(nextProps.item),
    });
  }

  toggle() {
    this.props.toggle(this.props.item);
  }

  render() {
    return (
      <View style={styles.cellContainer}>
        <Image
          style={styles.cellImage}
          source={{ uri: 'https://reactjs.org/logo-og.png' }}
        />
        <Text style={styles.cellLabel}>{this.props.item.username}</Text>
        <View style={styles.checkBouttonContainer}>
          <Icon.Button
            backgroundColor={this.state.isSelected ? 'blue' : 'white'}
            borderRadius={12}
            color={'white'}
            iconStyle={styles.checkButtonIcon}
            name={'check'}
            onPress={this.toggle}
            style={styles.checkButton}
          />
        </View>
      </View>
    );
  }
}

class NewGroup extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    const isReady = state.params && state.params.mode === 'ready';
    return {
      title: 'New Group',
      headerRight: isReady ? (
        <Button title="Next" onPress={state.params.finalizeGroup} />
      ) : (
        undefined
      ),
    };
  };
  constructor(props) {
    super(props);
    let selected = [];

    //FIX below will cause re-render constroctor called twice.
    if (this.props.navigation.state.params) {
      selected = this.props.navigation.state.params.selected;
    }
    this.state = {
      selected: selected || [],
      friends: props.user ? props.user.friends : [],
    };
    console.log('constructor');
    this.finalizeGroup = this.finalizeGroup.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    console.log('HW: componentDidMount');
    //FIX
    // this.refreashNavigation(this.state.selected);
  }
  componentWillReceiveProps(nextProps) {
    console.log('HW: componentWillReceiveProps');
    const state = {};
    if (
      nextProps.user &&
      nextProps.user.friends &&
      nextProps.user !== this.props.user
    ) {
      state.friends = nextProps.user.friends;
    }
    if (nextProps.selected) {
      Object.assign(state, {
        selected: nextProps.selected,
      });
    }
    // console.log('HW: setstate', state);
    // console.log(this.props);
    this.setState(state);
  }

  componentWillUpdate(nextProps, nextState) {
    console.log(
      'HW: componentWillUpdate nextstate.selected',
      nextState.selected,
    );
    if (!!this.state.selected.length !== !!nextState.selected.length) {
      console.log('REFRESH!');
      this.refreashNavigation(nextState.selected);
    }
  }

  refreashNavigation(selected) {
    const { navigation } = this.props;
    navigation.setParams({
      mode: selected && selected.length ? 'ready' : undefined,
      finalizeGroup: this.finalizeGroup,
    });
  }

  finalizeGroup() {
    console.log('HERRY', this.props.user);
    const { navigate } = this.props.navigation;
    navigate('FinalizeGroup', {
      selected: this.state.selected,
      friendCount: this.props.user.friends.length,
      userId: this.props.user.id,
    });
  }

  isSelected(user) {
    // console.log("!!!!", this.state.selected, " END");
    return ~this.state.selected.map(x => x.id).indexOf(user.id);
    // There is problem to check the selected items below.
    // return ~this.state.selected.indexOf(user);
  }
  toggle(user) {
    //FIXED
    const i = this.state.selected.map(x => x.id).indexOf(user.id);

    if (~i) {
      const selected = update(this.state.selected, { $splice: [[i, 1]] });
      return this.setState({
        selected,
      });
    }
    const selected = [...this.state.selected, user];
    // console.log('DEBUG selected', selected);
    return this.setState({
      selected,
    });
  }
  keyExtractor = item => item.id.toString();

  _renderItem = ({ item }) => (
    <Cell isSelected={this.isSelected} toggle={this.toggle} item={item} />
  );

  render() {
    const { user, loading } = this.props;
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {this.state.selected.length ? (
          <View style={styles.selected}>
            <SelectedUserList data={this.state.selected} remove={this.toggle} />
          </View>
        ) : (
          undefined
        )}

        {_.keys(this.state.friends).length ? (
          <FlatList
            data={this.state.friends}
            keyExtractor={this.keyExtractor}
            renderItem={this._renderItem}
            ListHeaderComponent={<View />}
          />
        ) : (
          undefined
        )}
      </View>
    );
  }
}

const userQuery = graphql(USER_QUERY, {
  options: ownProps => ({ variables: { id: 1 } }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user,
  }),
});
export default compose(userQuery)(NewGroup);
