import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";

const styles = () => {
  toolbarButton: {
    display: "flex";
  }
};

class DeleteButton extends Component {
  render() {
    return (
      <IconButton
        color="secondary"
        size="medium"
        aria-label="add"
        className={this.props.classes.toolbarButton}
        onClick={this.props.onClick}
      >
        <CancelIcon />
      </IconButton>
    );
  }
}

export default withStyles(styles)(DeleteButton);
