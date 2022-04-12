import "./App.css";
import { useEffect, useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import { ethers } from "ethers";

import { address } from "./address";
import XCoinStaking from "./artifacts/contracts/XCoinStaking.sol/XCoinStaking.json";
import StakesList from "./components/StakesList";
import PendingTransactionModal from "./components/PendingTransactionModal";

const App = () => {
  const [stakingAmount, setStakingAmount] = useState();
  const [myStakes, setMyStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabledStakeButton, setEnabledStakeButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingTransation, setPendingTransaction] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (stakingAmount !== undefined && parseInt(stakingAmount) > 0)
      setEnabledStakeButton(true);
    else setEnabledStakeButton(false);
  }, [stakingAmount]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(
    address,
    XCoinStaking.abi,
    provider.getSigner()
  );

  async function requestAccount() {
    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (account.length > 0) {
      const ownerAddress = await contract.owner();
      if (ownerAddress.toLowerCase() == account[0].toLowerCase())
        setIsOwner(true);
    }
  }

  async function getStakePlacements() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const stakePlacementsNumber = await contract.getMyStakesNumber();
        let myOldStakes = [];
        for (let i = 0; i < stakePlacementsNumber; i++) {
          try {
            const data = await contract.getStakeInfo(i);
            myOldStakes.push(parseInt(data._hex));
          } catch (err) {
            console.log(err);
          }
        }
        setMyStakes(myOldStakes);
        setLoading(false);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  useEffect(() => {
    requestAccount()
      .then(() => setErrorMessage(""))
      .catch(() => setErrorMessage("Pleas log in into your metamask account"));
    getStakePlacements();
  }, []);

  async function stake(amount) {
    if (typeof window.ethereum !== "undefined") {
      try {
        const data = await contract.stake(amount);
        const currentTxHash = data.hash;
        setTxHash(data.hash);

        setPendingTransaction(true);
        provider.once(currentTxHash, (transaction) => {
          setMyStakes([...myStakes, amount]);
          setPendingTransaction(false);
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function withdrawStake(index) {
    if (typeof window.ethereum !== "undefined") {
      try {
        const data = await contract.withdrawStake(index);
        const currentTxHash = data.hash;
        setTxHash(data.hash);
        setPendingTransaction(true);

        provider.once(currentTxHash, (transaction) => {
          setPendingTransaction(true);
          setMyStakes(
            myStakes.filter((item, itemIndex) => itemIndex !== index)
          );
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  if (errorMessage !== "") return <p>{errorMessage}</p>;

  return (
    <div>
      {isOwner ? <Button>Yes</Button> : null}
      <div className="App">
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

        <PendingTransactionModal txHash={txHash} open={pendingTransation} />
      </div>
    </div>
  );
};

export default App;
