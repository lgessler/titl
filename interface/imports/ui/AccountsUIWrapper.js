import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";

export default class AccountsUIWrapper extends Component {
  // Use Meteor Blaze to Render Login Buttons
  componentDidMount() {
    this.view = Blaze.render(
      Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.container)
    );
  }

  // Clean up Blaze View on Unmount
  componentWillUnmount() {
    Blaze.remove(this.view);
  }

  render() {
    // Just render a placeholder container that will be filled in
    return <span ref="container" />;
  }
}
