import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { makeStyles } from '@material-ui/styles';
import Paper from '@material-ui/core/Paper';
import Container from "@material-ui/core/Container";
import Sentence from "./Sentence";

const useStyles = makeStyles((theme) => {

});

export default function SentenceList(props) {
  const styles = useStyles();
  return (
    <Container maxWidth="md">
      {props.sentences.map((s) => {
        return <Sentence sentence={s} key={s._id} />
      })}
    </Container>
  )
}
