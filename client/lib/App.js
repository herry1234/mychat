/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createHttpLink } from 'apollo-link-http';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ReduxCache, apolloReducer } from 'apollo-cache-redux';
import ReduxLink from 'apollo-link-redux';
import { onError } from 'apollo-link-error';

import AppWithNavigationState, {
  navigationReducer,
  navigationMiddleWare,
} from './navigation';

const URL = '192.168.199.137:8000';

const store = createStore(
  combineReducers({
    nav: navigationReducer,
    apollo: apolloReducer,
  }),
  applyMiddleware(navigationMiddleWare),
);

const cache = new ReduxCache({
  store,
});
const reduxLink = new ReduxLink(store);
const errorLink = onError(errors => {
  console.log(errors);
});
const httpLink = createHttpLink({
  uri: `http://${URL}/graphql`,
});
const link = ApolloLink.from([reduxLink, errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache,
});
// const instructions = Platform.select({
//   ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
//   android:
//     "Double tap R on your keyboard to reload,\n" +
//     "Shake or press menu button for dev menu"
// });
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F5FCFF"
//   },
//   welcome: {
//     fontSize: 20,
//     textAlign: "center",
//     margin: 10
//   },
//   instructions: {
//     textAlign: "center",
//     color: "green",
//     marginBottom: 5
//   }
// });

// const App = () => (
//   <ApolloProvider client={client}>
//     <Provider store={store}>
//       <AppWithNavigationState />
//     </Provider>
//   </ApolloProvider>
//   );

export default class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <AppWithNavigationState />
        </Provider>
      </ApolloProvider>
    );
  }
}
