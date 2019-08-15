import ListItemText from "@material-ui/core/ListItemText";
import React, {useState} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

export default function ImportDialog(props) {
  const [stage, setStage] = useState("prompt");
  const [filename, setFilename] = useState("");

  function beginUpload () {
    Meteor.call('sentences.importFromTsv', undefined, filename);
    props.setImportOpen(false);
  }

  const uploadPrompt = (
    <>
      <DialogContent>
        <DialogContentText>
          Enter the name of a file hosted at '{Meteor.settings.public.defaultUrl}', e.g. 'arapaho_sentences.tsv'.
        </DialogContentText>
        <TextField autoFocus
                   margin="dense"
                   id="filename"
                   label="TSV file name"
                   fullWidth
                   onChange={(e) => setFilename(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.setImportOpen(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={beginUpload} color="primary">
          Upload
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog open={props.importOpen} onClose={() => props.setImportOpen(false)}>
      <DialogTitle id="form-dialog-title">Upload Data from TSV</DialogTitle>
        {stage === "prompt"
          ? uploadPrompt
          : ""}
    </Dialog>
  );
}
