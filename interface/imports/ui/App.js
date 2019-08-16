import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider, makeStyles } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

import { Sentences } from "../api/sentences";
import AccountsUIWrapper from "./AccountsUIWrapper.js";
import AddSentence from "./AddSentence.js";
import Sidebar from "./Sidebar.js";
import InteractiveQuerySession from "./InteractiveQuerySession";
import SentenceList from "./SentenceList";

function App(props) {
  const theme = createMuiTheme();
  const useStyles = makeStyles(() => ({
    root: {
      flexGrow: 1
    },
    toolbar: {
      display: "flex",
      flexDirection: "row"
    },
    loginButton: {
      marginLeft: "auto"
    },
    centeringDiv: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    wrapper: {
      display: "flex",
      marginTop: "25%"
    },
    drawerButton: {
      marginRight: "2rem"
    }
  }));
  const styles = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  function handleDrawerOpen() {
    setDrawerOpen(true);
  }
  function handleDrawerClose() {
    setDrawerOpen(false);
  }

  //className={clsx(open && classes.hide)}
  return (
    <div className={styles.root}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar variant="dense" className={styles.toolbar}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              className={styles.drawerButton}
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Active Learning Interface
            </Typography>
            <Button
              color="inherit"
              size="small"
              className={styles.loginButton}
              onClick={e => {
                e.preventDefault();
                if (props.currentUser) Meteor.logout();
              }}
            >
              {props.currentUser ? "Log Out" : ""}
            </Button>
          </Toolbar>
        </AppBar>
        <Sidebar
          drawerOpen={drawerOpen}
          handleDrawerClose={handleDrawerClose}
        />

        {props.currentUser ? (
          Meteor.settings.public.annotationLevel === "sentence" ? (
            <InteractiveQuerySession
              sentences={props.sentences}
              currentUser={props.currentUser}
            />
          ) : (
            <SentenceList
              sentences={props.sentences}
              currentUser={props.currentUser}
            />
          )
        ) : (
          <div className={styles.centeringDiv}>
            <div className={styles.wrapper}>
              <AccountsUIWrapper />
            </div>
          </div>
        )}
        <AddSentence />
      </ThemeProvider>
    </div>
  );
}

export default withTracker(() => {
  Meteor.subscribe("sentences");

  return {
    sentences: Sentences.find({}, { sort: { readableId: 1 } }).fetch(),
    currentUser: Meteor.user()
  };
})(App);
