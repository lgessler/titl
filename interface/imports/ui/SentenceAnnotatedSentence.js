import React, { Component } from "react";

import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/styles";
import grey from '@material-ui/core/colors/grey';

import SpanAnnotation from "./SpanAnnotation";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";

const styles = theme => ({
  card: {
    paddingTop: theme.spacing(5),
    margin: theme.spacing(2),
    position: "relative",
    overflow: "visible",
  },
  subtitle: {
    position: "absolute",
    right: theme.spacing(7),
    top: theme.spacing(2),
    color: grey["700"]
  },
  remove: {
    position: "absolute",
    right: "-15px",
    top: "-15px"
  }
});

class SentenceAnnotatedSentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteHidden: true,
      selBegin: 0,
      selEnd: 0,
      type: "",
    };
    this.handleChange = this.handleChange.bind(this);
  }

  toggleDelete = deleteHidden => {
    this.setState({ deleteHidden });
  };

  handleChange(e) {

  }

  render() {
    const { readableId } = this.props.sentence;
    return (
      <Card
        className={this.props.classes.card}
        onMouseEnter={() => this.toggleDelete(false)}
        onMouseLeave={() => this.toggleDelete(true)}
      >
        <CardContent>
          {this.state.deleteHidden ? null : (
            <IconButton
              size="small"
              className={this.props.classes.remove}
              onClick={() => {
                Meteor.call("sentences.remove", this.props.sentence._id);
              }}
            >
              <CancelIcon />
            </IconButton>
          )}
          <Typography
            variant="subtitle2"
            className={this.props.classes.subtitle}
          >
            {"Sentence #" + readableId}
          </Typography>
          <div
            className="sentence"
            onKeyUp={this.handleSelection}
            onKeyDown={this.clearSelection}
          >
            {this.props.sentence.sentence}
          </div>
          <FormControl>
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
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(SentenceAnnotatedSentence);
