import React from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const PendingTransactionModal = ({ open, txHash }) => {
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          padding: "1em",
          textAlign: "center",
        }}
      >
        <DialogTitle id="alert-dialog-title">Pending transaction</DialogTitle>
        <DialogContentText
          sx={{
            margin: "1em",
            textAlign: "center",
            fontSize: ".9rem",
          }}
          id="alert-dialog-description"
        >
          {txHash}
        </DialogContentText>
        <DialogContent>
          <div className="progress-bar">
            <CircularProgress />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingTransactionModal;
