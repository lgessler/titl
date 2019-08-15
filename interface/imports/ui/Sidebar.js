import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {makeStyles, ThemeProvider} from "@material-ui/styles";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import ImportDialog from "./ImportDialog";

function Sidebar(props) {
  const drawerWidth = 240;
  const useStyles = makeStyles(theme => ({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
  }));
  const classes = useStyles();
  const [importOpen, setImportOpen] = React.useState(false);

  return (
    <Drawer
      className={classes.drawer}
      variant="temporary"
      anchor="left"
      open={props.drawerOpen}
      classes={{
        paper: classes.drawerPaper,

      }}
      onClose={props.handleDrawerClose}
    >
      <List>
        <ListItem button key="import" onClick={() => setImportOpen(true)}>
          <ListItemIcon><ImportExportIcon /></ListItemIcon>
          <ListItemText>
            Import from TSV
            <ImportDialog importOpen={importOpen} setImportOpen={setImportOpen} />
          </ListItemText>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar