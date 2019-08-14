import React, { Component } from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/styles";
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';

const styles = theme => ({
  card: {
    paddingTop: theme.spacing(4),
    margin: theme.spacing(2),
    position: "relative"
  },
  subtitle: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1),
    color: grey["700"]
  },
  selected: {
    backgroundColor: red["300"]
  }
});

class Sentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selBegin: 0,
      selEnd: 0
    };
  }

  // Returns HTML for Displaying Sentence
  computeChildren() {
    // Decompose Sentence Prop
    let { sentence, spanAnnotations } = this.props.sentence;

    // Grab a Copy of spanAnnotations Array
    spanAnnotations = spanAnnotations.slice(0);

    // Set a Highlighted Annotation Based on State's selBegin/End
    if (this.state.selBegin !== this.state.selEnd)
      spanAnnotations.push({
        begin: this.state.selBegin,
        end: this.state.selEnd,
        selected: true
      });

    // Sort All Annotations Based on Begin
    spanAnnotations.sort(({ begin }) => begin);

    // Iterate Through All Span Annotations, Highlighting Those Selected
    let lastIndex = 0;
    const children = [];
    for (let { begin, end, selected } of spanAnnotations) {
      children.push(sentence.slice(lastIndex, begin));
      children.push(
        <SpanAnnotation
          text={sentence.slice(begin, end)}
          key={begin}
          classes={this.props.classes}
          selected={selected && begin !== end}
        />
      );
      lastIndex = end;
    }
    children.push(sentence.slice(lastIndex));

    // Return The Altered Array
    return children;
  }

  // Clear User's Selecting
  clearSelection() {
    window.getSelection().empty();
  }

  handleSelection = () => {
    // Grab Distance from Beginning to Node, if it Exists, Else 0
    function lenToLeft(node) {
      return !node
        ? 0
        : node.textContent.length + lenToLeft(node.previousSibling);
    }

    // Grab Highest Parent Node Under Sentence
    function ascend(node) {
      while (node.parentNode && node.parentNode.className !== "sentence")
        node = node.parentNode;
      return node;
    }

    // Grab and Clear User's Selection
    const sel = window.getSelection();

    // Only Set Selection if Anchor and Focus Has Direct Parent that is Ancestor of the Other
    if (
      sel.focusNode.parentNode.contains(sel.anchorNode) ||
      sel.anchorNode.parentNode.contains(sel.focusNode)
    ) {
      // Set Begin/End Accordingly by Offset and Length to Left of Original Text
      let selBegin =
        sel.anchorOffset + lenToLeft(ascend(sel.anchorNode).previousSibling);
      let selEnd =
        sel.focusOffset + lenToLeft(ascend(sel.focusNode).previousSibling);

      // Interchange Begin and End To Proper Order, if Need Be
      if (selBegin > selEnd) [selBegin, selEnd] = [selEnd, selBegin];

      this.setState({ selBegin, selEnd });
    }

    // Reset User's Selection
    this.clearSelection();
  };

  render() {
    const { readableId } = this.props.sentence;
    return (
      <Card
        className={this.props.classes.card}
        onMouseUp={this.handleSelection}
      >
        <CardContent>
          <Typography
            variant="subtitle2"
            className={this.props.classes.subtitle}
          >
            {"Sentence #" + readableId}
          </Typography>
          <div
            className="sentence"
            onKeyUp={this.handleSelection}
            onKeyDown={this.clearSelection}
            onMouseDown={this.clearSelection}
          >
            {this.computeChildren()}
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(Sentence);
