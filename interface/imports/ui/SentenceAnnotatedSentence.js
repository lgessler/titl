import React, { Component } from "react";

import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/styles";
import grey from "@material-ui/core/colors/grey";

import { Meteor } from "meteor/meteor";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

const styles = theme => ({
  card: {
    paddingTop: theme.spacing(5),
    margin: theme.spacing(2),
    position: "relative",
    overflow: "visible"
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
  },
  toggle: {
    display: "block",
    textAlign: "center"
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
      relevant: false
    };
    this.toggleRelevant = this.toggleRelevant.bind(this);
  }

  toggleDelete = deleteHidden => {
    this.setState({ deleteHidden });
  };

  toggleRelevant(e) {
    this.setState({ relevant: !this.state.relevant });
    Meteor.call(
      "sentences.addAnnotation",
      this.props.sentence._id,
      "relevant",
      !this.state.relevant
    );
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

          <FormControlLabel
            control={
              <Switch
                checked={this.state.relevant}
                onChange={this.toggleRelevant}
                value="relevant"
                color="primary"
              />
            }
            label="Relevant"
            className={this.props.classes.toggle}
          />
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(SentenceAnnotatedSentence);
