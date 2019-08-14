import React, {Component} from "react";
import {Meteor} from "meteor/meteor";
import classNames from "classnames";
import MenuItem from "@material-ui/core/MenuItem";
import {withStyles, ThemeProvider} from "@material-ui/styles";
import {green, red} from "@material-ui/core/colors";
import {createMuiTheme} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Paper from "@material-ui/core/Paper";
import CheckIcon from "@material-ui/icons/Check"
import CancelIcon from "@material-ui/icons/Cancel"
import IconButton from "@material-ui/core/IconButton";

const styles = theme => ({
  spanAnnotation: {
    position: "relative",
    borderRadius: '0.7rem',
    margin: theme.spacing(-0.3),
    padding: theme.spacing(0.3)
  },
  selected: {
    backgroundColor: red["300"]
  },
  toolbar: {
    position: "absolute",
    bottom: "calc(105%)",
    left: "50%",
    display: "flex",
    flexDirection: "row",
    spaceBetween: "1.2"
  },
  typeControlBackground: {
    marginRight: theme.spacing(0.5),
    display: "flex",
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5)
  },
  typeControl: {
    minWidth: "100px",
  },
  toolbarButton: {
    display: "flex",
  }
});

class SpanAnnotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.stopBubbling = this.stopBubbling.bind(this);
  }

  handleChange(e) {
    this.setState({
      type: e.target.value
    });
  }

  stopBubbling(e) {
    e.stopPropagation();
  }

  render() {
    const types = Meteor.settings.public.spanAnnotationTypes;

    const redGreenTheme = createMuiTheme({
      palette: {
        secondary: red,
        primary: green,
      }
    });

    const toolbar = (
      <div className={this.props.classes.toolbar}>
        <Paper onMouseUp={this.stopBubbling}
               onKeyUp={this.stopBubbling}
               className={this.props.classes.typeControlBackground}>
          <FormControl className={this.props.classes.typeControl}>
            <InputLabel htmlFor="type">Type</InputLabel>
            <Select
              value={this.state.type}
              onChange={this.handleChange}
              inputProps={{
                name: 'type',
                id: 'type',
              }}
            >
              {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>
        <ThemeProvider theme={redGreenTheme}>
          <IconButton color="primary" size="medium" aria-label="add" className={this.props.classes.toolbarButton}>
            <CheckIcon />
          </IconButton>
          <IconButton color="secondary" size="medium" aria-label="add" className={this.props.classes.toolbarButton}>
            <CancelIcon />
          </IconButton>
        </ThemeProvider>
      </div>
    );

    //const toolbar = toolbar; //!this.props.clearSelected ? null : menu;

    return (
      <>
        <span className={classNames(this.props.classes.spanAnnotation,
          this.props.clearSelected ? this.props.classes.selected : undefined)}>
          {this.props.text}
          {toolbar}
        </span>
      </>
    );
  }
}

export default withStyles(styles)(SpanAnnotation);
