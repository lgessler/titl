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
      spanAnnotations: [],
      annotations: []
    });
  };

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
            <Button onClick={this.closeAndSave} color="primary">
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(AddSentence);
