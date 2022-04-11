import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React, { useState } from "react";

const StakesListItem = ({ text, index, onClick }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <ListItem key={index} disablePadding>
        <ListItemButton onClick={handleClickOpen}>
          <ListItemText secondary={index} />
          <ListItemText primary={text} />
        </ListItemButton>
      </ListItem>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Withdraw the stake number {index}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            xCoins: {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            onClick={() => {
              handleClose();
              onClick(index);
            }}
            autoFocus
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StakesListItem;
