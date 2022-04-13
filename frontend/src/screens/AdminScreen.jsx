import React from "react";
import { Button, ListItemText } from "@mui/material";
import { useState, useEffect } from "react";

const AdminScreen = ({ isOwner, contract, provider }) => {
  const [totalStakes, setTotalStakes] = useState(0);

  async function distributeRewards() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const data = await contract.distributeRewards();
        const currentTxHash = data.hash;

        provider.once(currentTxHash, (transaction) => {
          console.log("ook boy");
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function getTotalStakes() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const data = await contract.totalStakes();
        setTotalStakes(parseInt(data._hex));
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  useEffect(() => {
    getTotalStakes();
  }, []);

  if (!isOwner) return <div>You dont have permission</div>;

  return (
    <div className="admin-container">
      <Button variant="contained" onClick={distributeRewards}>
        Distribute rewards
      </Button>
      <ListItemText primary="Total stakes" secondary={totalStakes} />
    </div>
  );
};

export default AdminScreen;
