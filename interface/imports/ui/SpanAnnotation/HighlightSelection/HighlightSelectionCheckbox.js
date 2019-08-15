import React, { Component } from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  checkbox: {
    float: "top",
    margin: "0px",
    padding: "0px 5px"
  }
});

class HighlightSelectionCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
  }

  handleCheck = () => {
    const checked = !this.state.checked;
    this.setState({ checked });
    this.props.handleCheck(this.props.begin, checked);
  };

  render() {
    return (
      <FormControlLabel
        control={
          <Checkbox
            className={this.props.classes.checkbox}
            checked={this.state.checked}
            onChange={this.handleCheck}
          />
        }
        label={this.props.sentence.slice(this.props.begin, this.props.end)}
        labelPlacement="end"
      />
    );
  }
}

export default withStyles(styles)(HighlightSelectionCheckbox);
