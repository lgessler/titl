import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import CheckIcon from "@material-ui/icons/Check";
import IconButton from "@material-ui/core/IconButton";

const styles = () => {
  toolbarButton: {
    display: "flex";
  }
};

class ApproveButton extends Component {
  render() {
    return (
      <IconButton
        color="primary"
        size="medium"
        aria-label="add"
        className={this.props.classes.toolbarButton}
        disabled={!this.props.type}
        onClick={this.props.onClick}
      >
        <CheckIcon />
      </IconButton>
    );
  }
}

export default withStyles(styles)(ApproveButton);
