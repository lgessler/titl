import React, { Component } from "react";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core";

const styles = () => ({
  remove: {
    position: "absolute",
    right: "-15px",
    top: "-15px"
  }
});

class SpanAnnotCardDelete extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.deleteHidden ? null : (
      <IconButton
        size="small"
        className={this.props.classes.remove}
        onClick={() => Meteor.call("sentences.remove", this.props.id)}
      >
        <CancelIcon />
      </IconButton>
    );
  }
}

export default withStyles(styles)(SpanAnnotCardDelete);
