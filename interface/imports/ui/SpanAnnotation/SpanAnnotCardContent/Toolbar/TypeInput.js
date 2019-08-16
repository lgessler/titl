import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

const styles = () => ({
  typeControl: {
    minWidth: "100px"
  }
});

class TypeInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // Types of Annotations to Be Selected From
    const types = Meteor.settings.public.spanAnnotationTypes;

    const saved = this.props.saved ? (
      <Select
        id="type-input"
        value={this.props.type}
        onChange={this.props.handleChange}
        inputProps={{
          name: "type",
          id: "type"
        }}
        disabled
      >
        {types.map(t => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </Select>
    ) : (
      <Select
        id="type-input"
        value={this.props.type}
        onChange={this.props.handleChange}
        inputProps={{
          name: "type",
          id: "type"
        }}
      >
        {types.map(t => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </Select>
    );

    return (
      <FormControl className={this.props.classes.typeControl}>
        <InputLabel htmlFor="type">Type</InputLabel>
        {saved}
      </FormControl>
    );
  }
}

export default withStyles(styles)(TypeInput);
