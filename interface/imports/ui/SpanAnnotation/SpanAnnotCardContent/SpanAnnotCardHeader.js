import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";

const styles = theme => ({
  subtitle: {
    position: "absolute",
    right: theme.spacing(7),
    top: theme.spacing(2),
    color: grey["700"]
  }
});

class SpanAnnotCardHeader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Typography variant="subtitle2" className={this.props.classes.subtitle}>
        {"Sentence #" + this.props.sentenceNum}
      </Typography>
    );
  }
}

export default withStyles(styles)(SpanAnnotCardHeader);
