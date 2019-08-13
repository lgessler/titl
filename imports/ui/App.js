import React, { Component } from 'react';
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider, makeStyles } from '@material-ui/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

import {Sentences} from "../api/sentences";
import AccountsUIWrapper from './AccountsUIWrapper.js';
import SentenceList from './SentenceList.js';
import AddSentence from './AddSentence.js';

function App(props) {
  const theme = createMuiTheme();
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    toolbar: {
      display: "flex",
      flexDirection: "row"
    },
    loginButton: {
      marginLeft: "auto"
    },
    loginBackground: {
      width: "100%",
      height: "100%"
    },
    centeringDiv: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    wrapper: {
      display: "flex",
      marginTop: "25%"
    }
  }));
  const styles = useStyles();

  const logInOrOut = (e) => {
    e.preventDefault();
    if (props.currentUser) {
      Meteor.logout();
    }
  };

  console.log(props.sentences);
  return (
    <div className={styles.root}>
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar variant="dense" className={styles.toolbar}>
            <Button color="inherit" size="small" className={styles.loginButton} onClick={logInOrOut}>
              {props.currentUser ? "Log Out" : ""}
            </Button>
          </Toolbar>
        </AppBar>
        {props.currentUser ?
          <SentenceList sentences={props.sentences} currentUser={props.currentUser} /> :
          <div className={styles.centeringDiv}>
            <div className={styles.wrapper}>
              <AccountsUIWrapper />
            </div>
          </div>
        }
        <AddSentence />
      </ThemeProvider>
    </div>
  );
}

export default withTracker(() => {
  Meteor.subscribe('sentences');

  return {
    sentences: Sentences.find({}, {sort: {readableId: 1}}).fetch(),
    currentUser: Meteor.user()
  };
})(App);
