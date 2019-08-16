import React, { Component } from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/styles";
import { green, red } from "@material-ui/core/colors";
import Toolbar from "./Toolbar/Toolbar";

const styles = theme => ({
  spanAnnotation: {
    position: "relative",
    borderRadius: "0.7rem",
    margin: theme.spacing(-0.3),
    padding: theme.spacing(0.3),
    "&:hover $savedToolbar": {
      visibility: "visible"
    }
  },
  toolbar: {
    position: "absolute",
    bottom: "calc(100%)",
    left: "50%"
  },
  savedToolbar: {
    visibility: "hidden",
    transitionDelay: "300ms",
    transitionProperty: "visibility"
  }
});

class SpanAnnotSentence extends Component {
  constructor(props) {
    super(props);
  }

  // Prevents Multiple Handling of Same Action
  stopBubbling = e => e.stopPropagation();

  render() {
    return (
      <span
        className={this.props.classes.spanAnnotation}
        style={{
          backgroundColor: this.props.clearSelected
            ? red["300"]
            : green[this.props.checked ? "300" : "100"]
        }}
      >
        {this.props.text}
        <div
          className={
            !this.props.type
              ? this.props.classes.toolbar
              : classNames(
                  this.props.classes.toolbar,
                  this.props.classes.savedToolbar
                )
          }
          onMouseUp={this.stopBubbling}
          onKeyUp={this.stopBubbling}
        >
          <Toolbar
            sentenceId={this.props.sentenceId}
            begin={this.props.begin}
            end={this.props.end}
            clearSelected={this.props.clearSelected}
            saved={this.props.type}
          />
        </div>
      </span>
    );
  }
}

export default withStyles(styles)(SpanAnnotSentence);
