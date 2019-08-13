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
      selEnd: 0,
    };
    this.handleSelection = this.handleSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
  }

  computeChildren() {
    var { sentence, spanAnnotations } = this.props.sentence;
    // grab a copy
    spanAnnotations = spanAnnotations.slice(0);

    var lastIndex = 0;
    if (this.state.selBegin !== this.state.selEnd) {
      spanAnnotations.push({
        begin: this.state.selBegin,
        end: this.state.selEnd,
        selected: true
      });
    }
    spanAnnotations.sort(({begin}) => begin);

    const children = [];
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
    return children;
  }

  clearSelection (e) {
    window.getSelection().empty();
  }

  handleSelection (e) {
    const sel = window.getSelection();

    function lenToLeft (node) {
      return !node ? 0 : node.textContent.length + lenToLeft(node.previousSibling);
    }
    function ascend(node) {
      while (node.parentNode.className !== "sentence") { node = node.parentNode; }
      return node;
    }
    var textLenToLeft = lenToLeft(ascend(sel.anchorNode).previousSibling);
    var selBegin = sel.anchorOffset + textLenToLeft;
    var selEnd = sel.focusOffset + textLenToLeft;
    if (selBegin > selEnd) {
      [selBegin, selEnd] = [selEnd, selBegin];
    }

    if (sel.anchorNode === sel.focusNode && sel.anchorNode.nodeName === "#text" &&
      ((selBegin <= this.state.selBegin && selEnd <= this.state.selEnd)
        || (selBegin >= this.state.selBegin && selEnd >= this.state.selEnd))) {
      this.setState({selBegin, selEnd});
    }
    sel.empty();
  }

  render () {
    const { readableId } = this.props.sentence;
    return (
      <Card className={this.props.classes.card}>
        <CardContent>
          <Typography variant="subtitle2" className={this.props.classes.subtitle}>
            {"Sentence #" + readableId}
          </Typography>
          <div
            className="sentence"
            onKeyUp={this.handleSelection}
            onKeyDown={this.clearSelection}
            onMouseUp={this.handleSelection}
            onMouseDown={this.clearSelection}>
            {this.computeChildren()}
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(Sentence);
