import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

import { Sentences } from '../api/sentences.js';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {withStyles, makeStyles} from "@material-ui/styles";
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';
import classNames from 'classnames'

const styles = theme => ({
  card: {
    paddingTop: theme.spacing(4),
    margin: theme.spacing(2),
    position: "relative",
  },
  subtitle: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1),
    color: grey['700']
  },
  spanAnnotation: {
    borderRadius: '1rem',
    margin: theme.spacing(-0.3),
    padding: theme.spacing(0.3),
  },
  selected: {
    backgroundColor: red['300']
  }
});

class SpanAnnotation extends Component {
  render() {
    return (
      <span className={classNames(this.props.classes.spanAnnotation,
                                  this.props.selected ? this.props.classes.selected : undefined)}>
        {this.props.text}
      </span>
    );
  }
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
      children.push(<SpanAnnotation text={sentence.slice(begin, end)}
                                    key={begin}
                                    classes={this.props.classes}
                                    selected={selected && begin !== end} />);
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
        || (selBegin >= this.state.selBegin && selEnd >= this.state.selEnd))
      && selBegin !== selEnd) {
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