import React, { Component } from "react";
import { Meteor } from "meteor/meteor";

import { withStyles } from "@material-ui/styles";

import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const styles = {
  fab: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem"
  }
};

class AddSentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      text: ""
    };
  }

  // Open the Modal
  open = () => this.setState({ modalOpen: true });

  // Close the Modal
  close = () => this.setState({ modalOpen: false });

  // Closes the Modal and Inserts a New Sentence with Empty Span Annotations
  closeAndSave = () => {
    this.close();
    Meteor.call("sentences.insert", {
      sentence: this.state.text,
      annotations: [],
      spanAnnotations: [],
      zScore: 0
    });
  };

  readSentencesFromFile = () => {
    let reader = new FileReader();

    reader.onload = e => {
      const lines = e.target.result.split(/\r\n|\n/);
      lines.forEach((line, idx), () => {
        if (idx < 10)
          Meteor.call("sentences.insert", {
            sentence: line.slice(0, 1),
            spanAnnotations: [],
            zScore: this.zScore(line.slice(2))
          });
      });
    };

    reader.readAsText(this.state.text);
  };

  zScore(scores) {
    const mean = scores.reduce((a, b) => a + b / scores.length, 0);
    return (
      (scores.reduce((a, b) => (a > b ? a : b)) - mean) *
      ((scores.length - 1) / scores.reduce((a, b) => a + (b - mean) ** 2)) **
        0.5
    );
  }

  render() {
    return (
      <div>
        <Fab
          color="primary"
          label="Add"
          className={this.props.classes.fab}
          onClick={this.open}
        >
          <AddIcon />
        </Fab>
        <Dialog
          open={this.state.modalOpen}
          onClose={this.close}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle id="form-dialog-title">Add New Sentence</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter a sentence.</DialogContentText>
            <TextField
              autoFocus
              id="name"
              label="Sentence"
              margin="dense"
              fullWidth
              onChange={e => this.setState({ text: e.target.value })}
              onKeyPress={e => {
                if (e.key === "Enter") this.closeAndSave;
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.close} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.readSentencesFromFile} color="primary">
              Read from File
            </Button>
            <Button onClick={this.closeAndSave} color="primary">
              Add Sentence
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(AddSentence);
