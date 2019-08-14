import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Sentence from "./Sentence";

const useStyles = makeStyles(theme => ({
  zeroState: {
    marginTop: theme.spacing(5),
    textAlign: "center"
  }
}));

export default function SentenceList(props) {
  const styles = useStyles();
  const zeroState = (
    <Typography variant="subtitle1" className={styles.zeroState}>
      No sentences added yet. Use the button to add one.
    </Typography>
  );

  return (
    <Container maxWidth="sm">
      {props.sentences.length === 0
        ? zeroState
        : props.sentences
            .sort((s1, s2) => (s1.zScore <= s2.zScore ? s1 : s2))
            .map(s => {
              return <Sentence sentence={s} key={s._id} />;
            })}
    </Container>
  );
}
