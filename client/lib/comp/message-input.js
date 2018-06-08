import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    backgroundColor: '#f54fff',
    borderColor: '#dbdbdb',
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#dbdbdb',
    borderWidth: 1,
    borderRadius: 15,
    height: 40,
    paddingHorizontal: 8,
  },
  sendButtonContainer: {
    paddingRight: 12,
    paddingVertical: 6,
  },
  sendButton: {
    height: 40,
    width: 40,
  },
  iconStyle: {
    marginRight: 0,
  },
});

const sendButton = send => (
  <Icon.Button
    backgroundColor={'blue'}
    borderRadius={16}
    color={'white'}
    iconStyle={styles.iconStyle}
    name="send"
    onPress={send}
    size={32}
    style={styles.sendButton}
  />
);

class MessageInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.send = this.send.bind(this);
  }
  send() {
    this.props.send(this.state.text);
    this.textInput.clear();
    this.textInput.blur();
  }

  render() {
    return (
      //   <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={'position'}
        contentContainerStyle={styles.container}
        keyboardVerticalOffset={64}
        style={styles.container}
      >
        <View style={styles.inputContainer}>
          <TextInput
            ref={(ref) => {
              this.textInput = ref;
            }}
            onChangeText={text => this.setState({ text })}
            style={styles.input}
            placeholder="Your message pls"
          />
        </View>
        <View style={styles.sendButtonContainer} >
          {sendButton(this.send)}
        </View>

      </KeyboardAvoidingView>
      //   </View>
    );
  }
}
MessageInput.propTypes = {
  send: PropTypes.func.isRequired,
};
export default MessageInput;
