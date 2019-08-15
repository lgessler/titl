import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import SpanAnnotatedSentence from "./SpanAnnotatedSentence";
import SentenceAnnotatedSentence from "./SentenceAnnotatedSentence";

export default function SentenceList(props) {
  const useStyles = makeStyles(theme => ({
    zeroState: {
      marginTop: theme.spacing(5),
      textAlign: "center"
    }
  }));
  const styles = useStyles();
  const zeroState = (
    <Typography variant="subtitle1" className={styles.zeroState}>
      No sentences added yet. Use the button to add one.
    </Typography>
  );

  const mode = Meteor.settings.public.annotationLevel;
  return (
    <Container maxWidth="sm">
      {props.sentences.length === 0
        ? zeroState
        : props.sentences.map(s => {
            return mode === "sentence" ? (
              <SentenceAnnotatedSentence sentence={s} key={s._id} />
            ) : (
              <SpanAnnotatedSentence sentence={s} key={s._id} />
            );
          })}
    </Container>
  );
}
