import { Button, CircularProgress, TextField } from "@mui/material";
import React from "react";

import PendingTransactionModal from "../components/PendingTransactionModal";
import StakesList from "../components/StakesList";

const MainScreen = ({
  stakingAmount,
  setStakingAmount,
  stake,
  enabledStakeButton,
  myStakes,
  withdrawStake,
  txHash,
  pendingTransation,
  loading,
  claimRewards,
  rewards,
}) => {
  return (
    <div>
      {/* {isOwner ? <Button>Yes</Button> : null} */}
      <div className="stake-container">
        <TextField
          id="filled-basic"
          label="Staking amount"
          variant="filled"
          value={stakingAmount}
          type="number"
          onChange={(event) => setStakingAmount(event.target.value)}
        />

        <Button
          className="Button"
          variant="contained"
          disabled={!enabledStakeButton}
          onClick={() => stake(stakingAmount)}
        >
          Stake
        </Button>

        {loading ? (
          <div className="progress-bar">
            <CircularProgress />
          </div>
        ) : (
          <StakesList list={myStakes} onClick={withdrawStake} />
        )}
        <Button
          className="Button"
          variant="contained"
          disabled={rewards <= 0}
          onClick={claimRewards}
        >
          Claim rewards ({rewards})
        </Button>
        <PendingTransactionModal txHash={txHash} open={pendingTransation} />
      </div>
    </div>
  );
};

export default MainScreen;
