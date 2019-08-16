import React, { Component } from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { withStyles } from "@material-ui/styles";
import SpanAnnotSentence from "./SpanAnnotCardContent/SpanAnnotSentence";
import HighLightSelection from "./HighlightSelection/HighlightSelection";
import SpanAnnotCardHeader from "./SpanAnnotCardContent/SpanAnnotCardHeader";
import SpanAnnotCardDelete from "./SpanAnnotCardContent/SpanAnnotCardDelete";

const styles = theme => ({
  card: {
    paddingTop: theme.spacing(5),
    margin: theme.spacing(2),
    position: "relative",
    overflow: "visible",
    "&:hover $highlightSelection": {
      visibility: "visible"
    }
  },
  highlightSelection: {
    paddingTop: theme.spacing(5),
    "margin-left": theme.spacing(2),
    visibility: "hidden",
    transitionDelay: "300ms",
    transitionProperty: "visibility",
    position: "absolute",
    left: "100%",
    width: "50%",
    top: "0%",
    height: "100%",
    "overflow-y": "scroll"
  }
});

class SpanAnnotCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteHidden: true,
      selBegin: 0,
      selEnd: 0
    };
  }

  // Returns HTML for Displaying SpanAnnotatedSentence
  computeChildren = () => {
    // Decompose SpanAnnotatedSentence Prop
    let { sentence, spanAnnotations } = this.props.sentence;

    // Grab a Copy of spanAnnotations Array
    spanAnnotations = spanAnnotations.slice(0);

    // Set a Highlighted Annotation Based on State's selBegin/End
    if (this.state.selBegin !== this.state.selEnd)
      spanAnnotations.push({
        name: "type",
        value: "",
        begin: this.state.selBegin,
        end: this.state.selEnd,
        selected: true
      });

    // Sort All Annotations Based on Begin
    spanAnnotations.sort((old, a) => {
      return old.begin - a.begin;
    });

    // Iterate Through All Span Annotations, Highlighting Those Selected
    let lastIndex = 0;
    const children = [];
    const clearSelected = () => {
      this.setState({ selBegin: 0, selEnd: 0 });
    };

    for (let { type, begin, end, selected } of spanAnnotations.filter(
      x => x.type || x.selected
    )) {
      children.push(sentence.slice(lastIndex, begin));
      children.push(
        <SpanAnnotSentence
          text={sentence.slice(begin, end)}
          sentenceId={this.props.sentence._id}
          begin={begin}
          end={end}
          key={begin}
          type={type}
          checked={
            this.props.sentence.spanAnnotations.filter(
              e => e.begin === begin
            )[0] &&
            this.props.sentence.spanAnnotations.filter(
              e => e.begin === begin
            )[0].checked
          }
          clearSelected={selected && begin !== end && clearSelected}
        />
      );
      lastIndex = end;
    }
    children.push(sentence.slice(lastIndex));

    // Return The Altered Array
    return children;
  };

  handleSelection = () => {
    // Grabs Distance from Beginning to Node, if it Exists, Else 0
    function lenToLeft(node) {
      if (!node) return 0;

      const toolbar =
        node &&
        node.lastChild &&
        node.lastChild.nodeName === "DIV" &&
        node.lastChild;
      return (
        node.textContent.length -
        (toolbar ? toolbar.textContent.length : 0) +
        lenToLeft(node.previousSibling)
      );
    }

    // Grabs Highest Parent Node Under SpanAnnotatedSentence
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
      if (ascSelAnchor.parentNode.className.includes(this.props.classes.card))
        selBegin = 0;
      if (ascSelFocus.parentNode.className.includes(this.props.classes.card))
        selEnd = 0;

      // Interchange Begin and End To Proper Order, if Need Be
      if (selBegin > selEnd) [selBegin, selEnd] = [selEnd, selBegin];

      // If There is Any Overlap with Other Highlights, Separate Them
      this.props.sentence.spanAnnotations.forEach(a => {
        if (
          (selBegin >= a.begin && selEnd <= a.end) ||
          (selBegin <= a.begin && selEnd >= a.end)
        )
          selBegin = selEnd = 0;
        else if (selBegin >= a.begin && selBegin <= a.end) selBegin = a.end;
        else if (selEnd >= a.begin && selEnd <= a.end) selEnd = a.begin;
      });

      // Update the State
      this.setState({ selBegin, selEnd });
    }

    // Reset User's Selection
    this.clearSelection();
  };

  // Clear User's Selecting
  clearSelection() {
    window.getSelection().empty();
  }

  toggleDelete = () =>
    this.setState({ deleteHidden: !this.state.deleteHidden });

  render() {
    return (
      <Card
        className={this.props.classes.card}
        onMouseUp={this.handleSelection}
        onMouseDown={this.clearSelection}
        onMouseEnter={this.toggleDelete}
        onMouseLeave={this.toggleDelete}
      >
        <Card className={this.props.classes.highlightSelection}>
          <HighLightSelection sentence={this.props.sentence} />
        </Card>
        <CardContent>
          <SpanAnnotCardDelete
            deleteHidden={this.state.deleteHidden}
            id={this.props.sentence._id}
          />
          <SpanAnnotCardHeader sentenceNum={this.props.sentence.readableId} />
          <div className="sentence">{this.computeChildren()}</div>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(SpanAnnotCard);
