import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  //   addNavigationHelpers,
  StackActions,
  NavigationActions,
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

//https://www.sohamkamani.com/blog/2017/03/31/react-redux-connect-explained/

/*
There are lots of issues(changes) on react-navigation. 
addNavigationHelpers has been removed from v2.0. 
https://github.com/react-navigation/react-navigation/pull/4179
https://github.com/react-navigation/react-navigation/issues/3930
Here is the example from master branch. It's NOT working with release version. 
https://github.com/react-navigation/react-navigation/blob/master/examples/ReduxExample/src/navigators/AppNavigator.js#L27

*/
import {
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware,
  //   createNavigationPropConstructor,
  //   initializeListeners
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';

import { Text, View, StyleSheet } from 'react-native';
import Groups from './screens/groups';
import Messages from './screens/messages';
import FinalizeGroup from './screens/finalize-group';
import NewGroup from './screens/new-group';
import GroupDetails from './screens/group-details';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  tabText: {
    color: '#777',
    fontSize: 12,
    justifyContent: 'center',
  },
  selected: {
    color: 'red',
  },
});

const MyScreen = title => () => (
  <View style={styles.container}>
    <Text>{title}</Text>
  </View>
);

const MainScreenNavigator = createBottomTabNavigator(
  {
    Chats: Groups,
    // Msg: Messages,
    Settings: { screen: MyScreen('Settings') },
  },
  {
    initialRouteName: 'Chats',
  },
);

const AppNavigator = createStackNavigator(
  {
    Main: { screen: MainScreenNavigator },
    Messages: { screen: Messages },
    FinalizeGroup: { screen: FinalizeGroup },
    NewGroup: { screen: NewGroup },
    GroupDetails: { screen: GroupDetails},
    
  },
  {
    mode: 'modal',
  },
);

const initialState = AppNavigator.router.getStateForAction(
  StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: 'Main',
      }),
    ],
  }),
);

export const navigationReducer = (state = initialState, action) => {
  const nextState = AppNavigator.router.getStateForAction(action, state);
  return nextState || state;
};

export const navigationMiddleWare = createReactNavigationReduxMiddleware(
  'root',
  state => state.nav,
);
// react-navigation@2.0.4 or later only
// const navigationPropConstructor = createNavigationPropConstructor("root");
// alternative to createNavigationPropConstructor
const addListener = createReduxBoundAddListener('root');

// const AppWithNavigationState = props => {
//   const navigation = {
//     dispatch: props.dispatch,
//     state: props.nav,
//     addListener
//   };
//   return (
//     <AppNavigator navigation={navigation} />
//   );
// };

class AppWithNavigationState extends Component {
  //   static propTypes = {
  //     dispatch: PropTypes.func.isRequired,
  //     nav: PropTypes.object.isRequired
  //   };
    // componentDidMount() {
    //   initializeListeners("root", this.props.nav);
    // }
  render() {
    const { dispatch, nav } = this.props;
    // const navigation = navigationPropConstructor(dispatch, nav);
    const navigation = {
      dispatch: dispatch,
      state: nav,
      addListener: addListener,
    };
    return <AppNavigator navigation={navigation} />;
  }
}
const mapStateToProps = state => ({
  nav: state.nav,
});

export default connect(mapStateToProps)(AppWithNavigationState);
