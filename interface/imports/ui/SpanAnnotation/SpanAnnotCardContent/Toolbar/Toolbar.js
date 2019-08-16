import React, { Component } from "react";
import { withStyles, ThemeProvider } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import TypeInput from "./TypeInput";
import { createMuiTheme } from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
import ApproveButton from "./ApproveButton";
import CancelButton from "./CancelButton";
import DeleteButton from "./DeleteButton";

const styles = theme => ({
  typeControlBackground: {
    marginRight: theme.spacing(0.5),
    display: "flex",
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    flexDirection: "row"
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

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: ""
    };
  }

  // Updates Selected Type
  handleChange = e =>
    this.setState({
      type: e.target.value
    });

  // Adds spanAnnot and Clears the Highlight
  saveAndClear = () => {
    Meteor.call(
      "sentences.addSpanAnnotation",
      this.props.sentenceId,
      this.props.begin,
      this.props.end,
      "type",
      this.state.type
    );
    this.props.clearSelected();
  };

  // Removes the spanAnnot
  deleteAnnotation = () =>
    Meteor.call(
      "sentences.removeSpanAnnotation",
      this.props.sentenceId,
      this.props.begin,
      this.props.end
    );

  render() {
    // Coloring for Check and X Buttons
    const redGreenTheme = createMuiTheme({
      palette: {
        secondary: red,
        primary: green
      }
    });

    const toolbarButtonStyle = () => ({ toolbarButton: { display: "flex" } });

    return (
      <Paper className={this.props.classes.typeControlBackground}>
        <TypeInput
          type={this.state.type}
          saved={this.props.saved}
          handleChange={e => this.handleChange(e)}
        />
        <ThemeProvider theme={redGreenTheme}>
          {!this.props.saved ? (
            <>
              <ApproveButton
                type={this.state.type}
                style={toolbarButtonStyle}
                onClick={this.saveAndClear}
              />
              <CancelButton
                type={this.state.type}
                style={toolbarButtonStyle}
                onClick={this.clearSelected}
              />
            </>
          ) : (
            <DeleteButton
              style={toolbarButtonStyle}
              onClick={this.deleteAnnotation}
            />
          )}
        </ThemeProvider>
      </Paper>
    );
  }
}

export default withStyles(styles)(Toolbar);
