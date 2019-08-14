import React, {Component} from "react";
import {Meteor} from "meteor/meteor";
import classNames from "classnames";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import grey from "@material-ui/core/colors/grey";
import red from "@material-ui/core/colors/red";
import {withStyles} from "@material-ui/styles";


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
  spanAnnotation: {
    position: "relative",
    borderRadius: '0.7rem',
    margin: theme.spacing(-0.3),
    padding: theme.spacing(0.3)
  },
  selected: {
    backgroundColor: red["300"]
  }
});


class SpanAnnotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchor: null
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.menuItemClickedMaker = this.menuItemClickedMaker.bind(this);
  }

  handleClick(e) {
    this.setState({
      anchor: e.currentTarget
    })
  }

  handleClose(e) {
    this.setState({
      anchor: null
    });
  }

  menuItemClickedMaker(type) {
    return function(menuItemClicked) {

    }
  }

  render() {
    const types = Meteor.settings.public.spanAnnotationTypes;

    return (
      <>
        <span className={classNames(this.props.classes.spanAnnotation,
          this.props.selected ? this.props.classes.selected : undefined)}
              onClick={this.handleClick}>
          {this.props.text}
        </span>
        <Menu id="type-menu"
              anchorEl={this.state.anchor}
              onClickAway={this.handleClose}>
          {types.map(t =>
            <MenuItem onClick={this.menuItemClickedMaker(t)} />
          )}
        </Menu>
      </>
    );
  }
}

export default withStyles(styles)(SpanAnnotation);
