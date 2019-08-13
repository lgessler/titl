import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

import { Sentences } from '../api/sentences.js';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {withStyles, makeStyles} from "@material-ui/styles";
import grey from '@material-ui/core/colors/grey';

const styles = {
  card: {
    paddingTop: "2rem",
    margin: "1rem",
    position: "relative",
  },
  subtitle: {
    position: "absolute",
    right: "1rem",
    top: "0.5rem",
    color: grey['700']
  },
  red: {
    backgroundColor: 'red',
  }
}

function SpanAnnotation(props) {
  return (
    <span>{props.text}</span>
  );
}

function SpanSelection(props) {
  return (
    <span style={{backgroundColor: "red"}}>{props.text}</span>
  );
}

class Sentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selBegin: 0,
      selEnd: 0
    };
    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection (e) {
    const sel = window.getSelection();
    // ensure the selection spans a single text node
    if (sel.anchorNode === sel.focusNode && sel.anchorNode.nodeName === "#text") {
      this.setState({
        selBegin: sel.anchorOffset,
        selEnd: sel.focusOffset
      });
    }
  }

  render () {
    const { readableId, sentence, spanAnnotations } = this.props.sentence;
    const children = [];
    var lastIndex = 0;
    spanAnnotations.push({begin: this.state.selBegin, end: this.state.selEnd, selected: true});
    spanAnnotations.sort(({begin}) => begin);

    for (let {begin, end, selected} of spanAnnotations) {
      children.push(sentence.slice(lastIndex, begin));
      if (selected && begin !== end) {
        children.push(<SpanSelection text={sentence.slice(begin, end)} key={begin}/>);
      } else {
        children.push(<SpanAnnotation text={sentence.slice(begin, end)} key={begin}/>);
      }
      lastIndex = end;
    }
    children.push(sentence.slice(lastIndex));

    return (
      <Card className={this.props.classes.card}>
        <CardContent>
          <Typography variant="subtitle2" className={this.props.classes.subtitle}>
            {"Sentence #" + readableId}
          </Typography>
          <div onKeyUp={this.handleSelection} onMouseUp={this.handleSelection}>
            {children}
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(Sentence);
