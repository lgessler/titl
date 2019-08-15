import React from "react";
import { Meteor } from "meteor/meteor";
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import SpanAnnotatedSentence from "./SpanAnnotatedSentence";
import SentenceAnnotatedSentence from "./SentenceAnnotatedSentence";

export default function SentenceList(props) {
  // Creates Styles for Sentence List
  const styles = makeStyles(theme => ({
    zeroState: {
      marginTop: theme.spacing(5),
      textAlign: "center"
    }
  }))();

  // Default Display if There Are Not Yet Any Sentences
  const zeroState = (
    <Typography variant="subtitle1" className={styles.zeroState}>
      No sentences added yet. Use the button to add one.
    </Typography>
  );

  // Return HTML for Displaying All (if Any) Sentences
  return (
    <Container maxWidth="sm">
      {props.sentences.length === 0
        ? zeroState
        : props.sentences.map(s =>
            Meteor.settings.public.annotationLevel === "sentence" ? (
              <SentenceAnnotatedSentence sentence={s} key={s._id} />
            ) : (
              <SpanAnnotatedSentence sentence={s} key={s._id} />
            )
          )}
    </Container>
  );
}
