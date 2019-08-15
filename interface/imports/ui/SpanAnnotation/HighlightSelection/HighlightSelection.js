import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import CardContent from "@material-ui/core/CardContent";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import HighlightSelectionCheckbox from "./HighlightSelectionCheckbox";
import grey from "@material-ui/core/colors/grey";

const styles = theme => ({
  highlightSelectionSubtitle: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: grey["700"]
  }
});

class HighlightSelection extends Component {
  handleCheck = (beginIdx, checked) => {
    const s = this.props.sentence.spanAnnotations.filter(
      e => e.begin === beginIdx
    )[0];
    s.checked = checked;
  };

  render() {
    return (
      <CardContent>
        <Typography
          variant="subtitle2"
          className={this.props.classes.highlightSelectionSubtitle}
        >
          Highlight Selection
        </Typography>
        <FormControl>
          <FormGroup>
            {this.props.sentence.spanAnnotations
              .sort((old, e) => old.begin - e.begin)
              .map(e => (
                <HighlightSelectionCheckbox
                  begin={e.begin}
                  end={e.end}
                  sentence={this.props.sentence.sentence}
                  handleCheck={this.handleCheck}
                  key={e.begin}
                />
              ))}
          </FormGroup>
        </FormControl>
      </CardContent>
    );
  }
}

export default withStyles(styles)(HighlightSelection);
