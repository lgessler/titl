import React from "react";
import SentenceList from "./SentenceList.js";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import {Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {Meteor} from "meteor/meteor";

import { Sentences } from '../api/sentences.js';
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import grey from "@material-ui/core/colors/grey";
import Paper from "@material-ui/core/Paper";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

const useStyles = makeStyles(theme => ({
  card: {
    paddingTop: theme.spacing(5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: theme.spacing(2),
    position: "relative",
    overflow: "visible"
  },
  sentencePaper: {
    position: "relative",
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  subtitle: {
    position: "absolute",
    left: theme.spacing(0.3),
    top: theme.spacing(0.3),
    color: grey["700"]
  },
  toggle: {
    display: "block",
    textAlign: "center",
    margin: "auto 0"
  },
  toggleGrid: {
    display: "flex"
  }
}));

function SentenceToggle(props) {
  const [relevant, toggleRelevant] = React.useState(props.sentence.annotations.relevant || false);
  const handleToggle = () => {
    toggleRelevant(!relevant);
    Meteor.call("sentences.addAnnotation", props.sentence._id, "relevant", !relevant);
  };

  return (
    <Grid item xs={3} key={props.sentence._id} className={props.classes.toggleGrid}>
      <FormControlLabel
        control={
          <Switch
            checked={relevant}
            onChange={handleToggle}
            value="relevant"
            color="primary"
          />
        }
        label="Relevant"
        className={props.classes.toggle}
      />
    </Grid>
  );
}

export default function InteractiveQuerySession(props) {
  [inputSentence, setInputSentence] = React.useState("");
  [sentencesSeen, setSentencesSeen] = React.useState([]);

  const classes = useStyles();
  const unseenSentences = props.sentences.filter(s => sentencesSeen.indexOf(s) === -1);
  console.log(unseenSentences)
  const saveSentence = () => {
    setSentencesSeen(sentencesSeen.concat([inputSentence]));
    setInputSentence("");
    Meteor.call("sentences.insert", {
      sentence: inputSentence,
      annotations: {relevant: true},
      spanAnnotations: []
    });
  };
  const submitAnnotations = () => {
    setSentencesSeen(sentencesSeen.concat(unseenSentences));
    Meteor.call("sentences.populateFromQuery");
  };

  return (
    <Container maxWidth="md">
      <Card className={classes.card}>
        <DialogContent>
          <DialogContentText>
            Enter an example sentence in Arapaho.
          </DialogContentText>
          <TextField autoFocus
                     margin="dense"
                     id="filename"
                     fullWidth
                     onKeyPress={e => {
                       if (e.key === "Enter") saveSentence();
                     }}
                     value={inputSentence}
                     onChange={(e) => setInputSentence(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={saveSentence}
                  color="primary">
            Submit
          </Button>
        </DialogActions>

          <Grid container spacing={1}>
            {props.sentences.map(s => (
              <>
                <Grid item xs={9} key={s._id}>
                  <Paper className={classes.sentencePaper}>
                    <Typography
                      variant="subtitle2"
                      className={classes.subtitle}
                    >
                      {"#" + s.readableId}
                    </Typography>
                    {s.sentence}
                  </Paper>
                </Grid>
                <SentenceToggle classes={classes} sentence={s} />
              </>
            ))}
          </Grid>

        {Sentences.find().count() > 0 ? (
          <DialogActions>
            <Button onClick={submitAnnotations} color="primary">
              More Results
            </Button>
          </DialogActions>
        ) : ""}
      </Card>
    </Container>
  )

}