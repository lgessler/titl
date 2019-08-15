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
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {Meteor} from "meteor/meteor";

const useStyles = makeStyles(theme => ({
  card: {
    paddingTop: theme.spacing(5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: theme.spacing(2),
    position: "relative",
    overflow: "visible"
  },
}));

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
      annotations: {},
      spanAnnotations: []
    });
  };
  const submitAnnotations = () => {
    setSentencesSeen(sentencesSeen.concat(unseenSentences));
    Meteor.call("sentences.populateFromQuery");
  };

  return (
      <>
        <Container maxWidth="sm">
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
          </Card>
        </Container>
        <SentenceList
          sentences={unseenSentences}
          currentUser={props.currentUser}
        />
        <Container maxWidth="sm">
          <Card className={classes.card}>
            <DialogContent>
              <DialogContentText>
                Hit submit to retrieve more results
              </DialogContentText>
              <Button onClick={submitAnnotations} color="primary">
                Submit
              </Button>
            </DialogContent>
          </Card>
          <Card className={classes.card}>
            <Typography variant="subtitle1">
              Sentences seen so far:
            </Typography>
            <List dense={true}>
              {sentencesSeen.map(s => (
                <ListItem key={s.readableId}>
                  <ListItemText>
                    {s.sentence}
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Card>
        </Container>
      </>
    )

}