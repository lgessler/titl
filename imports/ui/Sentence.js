import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

import { Sentences } from '../api/sentences.js';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/styles";
import grey from '@material-ui/core/colors/grey';

const useStyles = makeStyles(theme => ({
  card: {
    margin: theme.spacing(2),
    position: "relative"
  },
  subtitle: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1),
    color: grey['700']
  }
}));

export default function Sentence (props) {
  const { readableId, sentence, spanAnnotations } = props.sentence;
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardContent>
        <Typography variant="subtitle2" className={styles.subtitle}>
          {"Sentence #" + readableId}
        </Typography>
        <p>{sentence}</p>
      </CardContent>
    </Card>
  );
}
