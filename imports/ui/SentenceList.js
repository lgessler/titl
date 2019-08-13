import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Sentence from "./Sentence";

const useStyles = makeStyles((theme) => ({
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
    <Container maxWidth="md">
      {props.sentences.length === 0 ?
        zeroState
        :
        props.sentences.map((s) => {
          return <Sentence sentence={s} key={s._id} />
        })}
    </Container>
  )
}
