import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import classNames from "classnames";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles, ThemeProvider } from "@material-ui/styles";
import { green, red } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Paper from "@material-ui/core/Paper";
import CheckIcon from "@material-ui/icons/Check";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";

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
  selected: {
    backgroundColor: red["300"]
  },
  saved: {
    backgroundColor: green[this.props && this.props.checked ? "300" : "100"]
  },
  toolbar: {
    position: "absolute",
    bottom: "calc(100%)",
    left: "50%"
  },
  typeControlBackground: {
    marginRight: theme.spacing(0.5),
    display: "flex",
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    flexDirection: "row"
  },
  typeControl: {
    minWidth: "100px"
  },
  toolbarButton: {
    display: "flex"
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
    this.state = {
      type: this.props.type || "",
      toolbarVisible: false
    };
  }

  // Updates Selected Type
  handleChange = e =>
    this.setState({
      type: e.target.value
    });

  // Prevents Multiple Handling of Same Action
  stopBubbling = e => e.stopPropagation();

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
    // Types of Annotations to Be Selected From
    const types = Meteor.settings.public.spanAnnotationTypes;

    // Coloring for Check and X Buttons
    const redGreenTheme = createMuiTheme({
      palette: {
        secondary: red,
        primary: green
      }
    });

    // Toolbar Used When Unsaved Highlight Selected
    const selectedToolbar = (
      <div
        className={this.props.classes.toolbar}
        onMouseUp={this.stopBubbling}
        onKeyUp={this.stopBubbling}
      >
        <Paper className={this.props.classes.typeControlBackground}>
          <FormControl className={this.props.classes.typeControl}>
            <InputLabel htmlFor="type">Type</InputLabel>
            <Select
              value={this.state.type}
              onChange={this.handleChange}
              inputProps={{
                name: "type",
                id: "type"
              }}
            >
              {types.map(t => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ThemeProvider theme={redGreenTheme}>
            <IconButton
              color="primary"
              size="medium"
              aria-label="add"
              className={this.props.classes.toolbarButton}
              disabled={!this.state.type}
              onClick={this.saveAndClear}
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              color="secondary"
              size="medium"
              aria-label="add"
              className={this.props.classes.toolbarButton}
              onClick={this.props.clearSelected}
            >
              <CancelIcon />
            </IconButton>
          </ThemeProvider>
        </Paper>
      </div>
    );

    // Toolbar Used When Saved Highlight is Hovered
    const savedToolbar = (
      <div
        className={classNames(
          this.props.classes.toolbar,
          this.props.classes.savedToolbar
        )}
        onMouseUp={this.stopBubbling}
        onKeyUp={this.stopBubbling}
      >
        <Paper className={this.props.classes.typeControlBackground}>
          <FormControl className={this.props.classes.typeControl}>
            <InputLabel htmlFor="type">Type</InputLabel>
            <Select
              value={this.state.type}
              onChange={this.handleChange}
              inputProps={{
                name: "type",
                id: "type"
              }}
              disabled
            >
              {types.map(t => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ThemeProvider theme={redGreenTheme}>
            <IconButton
              color="secondary"
              size="medium"
              aria-label="add"
              className={this.props.classes.toolbarButton}
              onClick={this.deleteAnnotation}
            >
              <CancelIcon />
            </IconButton>
          </ThemeProvider>
        </Paper>
      </div>
    );

    // Determines Toolbar to Be Displayed
    const toolbar = this.props.clearSelected ? selectedToolbar : savedToolbar;

    return (
      <>
        <span
          className={classNames(
            this.props.classes.spanAnnotation,
            this.props.clearSelected
              ? this.props.classes.selected
              : this.props.classes.saved
          )}
        >
          {this.props.text}
          {toolbar}
        </span>
      </>
    );
  }
}

export default withStyles(styles)(SpanAnnotSentence);
