import React, { Component } from "react";

import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/styles";
import grey from '@material-ui/core/colors/grey';

import SpanAnnotation from "./SpanAnnotation";

const styles = theme => ({
  card: {
    paddingTop: theme.spacing(5),
    margin: theme.spacing(2),
    position: "relative",
    overflow: "visible",
  },
  subtitle: {
    position: "absolute",
    right: theme.spacing(7),
    top: theme.spacing(2),
    color: grey["700"]
  },
  remove: {
    position: "absolute",
    right: "-15px",
    top: "-15px"
  }
});

class SpanAnnotatedSentence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteHidden: true,
      selBegin: 0,
      selEnd: 0
    };
  }

  // Returns HTML for Displaying SpanAnnotatedSentence
  computeChildren() {
    // Decompose SpanAnnotatedSentence Prop
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
    const clearSelected = () => {
      this.setState({selBegin: 0, selEnd: 0});
    };
    for (let { begin, end, type, selected } of spanAnnotations) {
      children.push(sentence.slice(lastIndex, begin));
      children.push(
        <SpanAnnotation
          text={sentence.slice(begin, end)}
          sentenceId={this.props.sentence._id}
          begin={begin}
          end={end}
          key={begin}
          type={type}
          clearSelected={selected
                         && begin !== end
                         && clearSelected}
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
      if (!node) {
        return 0;
      }
      const findToolbar = node => node && node.lastChild && node.lastChild.nodeName === "DIV" && node.lastChild;
      const toolbar = findToolbar(node);
      const textLength = toolbar ? node.textContent.length - toolbar.textContent.length : node.textContent.length;
      return textLength + lenToLeft(node.previousSibling);
    }

    // Grab Highest Parent Node Under SpanAnnotatedSentence
    const ascend = node => {
      while (
        node &&
        node.parentNode.className !== "sentence" &&
        !node.parentNode.className.includes(this.props.classes.card)
      )
        node = node.parentNode;

      return node;
    };

    // Grab and Clear User's Selection
    const sel = window.getSelection();

    // Set Begin/End Accordingly by Offset and Length to Left of Original Text
    const ascSelAnchor = ascend(sel.anchorNode);
    const ascSelFocus = ascend(sel.focusNode);
    let selBegin =
      sel.anchorOffset +
      lenToLeft(ascSelAnchor ? ascSelAnchor.previousSibling : null);
    let selEnd =
      sel.focusOffset +
      lenToLeft(ascSelFocus ? ascSelFocus.previousSibling : null);

    // Only Set Selection if Anchor and Focus Has Direct Parent that is Ancestor of the Other
    if (
      (ascSelFocus && ascSelFocus.parentNode.contains(sel.anchorNode)) ||
      (ascSelAnchor && ascSelAnchor.parentNode.contains(sel.focusNode))
    ) {
      // If Selection is in Card But Not On Annotation Text, Set Corresponding Begin or End to 0
      if (
        ascend(sel.anchorNode).parentNode.className.includes(
          this.props.classes.card
        )
      )
        selBegin = 0;
      if (
        ascend(sel.focusNode).parentNode.className.includes(
          this.props.classes.card
        )
      )
        selEnd = 0;

      // Interchange Begin and End To Proper Order, if Need Be
      if (selBegin > selEnd) [selBegin, selEnd] = [selEnd, selBegin];

      this.setState({ selBegin, selEnd });
    }

    // Reset User's Selection
    this.clearSelection();
  };

  toggleDelete = deleteHidden => {
    this.setState({ deleteHidden });
  };

  render() {
    const { readableId } = this.props.sentence;
    return (
      <Card
        className={this.props.classes.card}
        onMouseUp={this.handleSelection}
        onMouseDown={this.clearSelection}
        onMouseEnter={() => this.toggleDelete(false)}
        onMouseLeave={() => this.toggleDelete(true)}
      >
        <CardContent>
          {this.state.deleteHidden ? null : (
            <IconButton
              size="small"
              className={this.props.classes.remove}
              onClick={() => {
                Meteor.call("sentences.remove", this.props.sentence._id);
              }}
            >
              <CancelIcon />
            </IconButton>
          )}
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
          >
            {this.computeChildren()}
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(SpanAnnotatedSentence);
