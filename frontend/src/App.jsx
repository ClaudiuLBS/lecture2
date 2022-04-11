import "./App.css";
import { useEffect, useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import { ethers } from "ethers";

import { address } from "./address";
import XCoinStaking from "./artifacts/contracts/XCoinStaking.sol/XCoinStaking.json";
import StakesList from "./components/StakesList";

const App = () => {
  const [stakingAmount, setStakingAmount] = useState();
  const [myStakes, setMyStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabledStakeButton, setEnabledStakeButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function requestAccount() {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }

  async function getStakePlacements() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        address,
        XCoinStaking.abi,
        provider.getSigner()
      );
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
  });

  useEffect(() => {
    if (stakingAmount !== undefined && parseInt(stakingAmount) > 0)
      setEnabledStakeButton(true);
    else setEnabledStakeButton(false);
  }, [stakingAmount]);

  async function stake(amount) {
    if (typeof window.ethereum !== "undefined") {
      // await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        address,
        XCoinStaking.abi,
        provider.getSigner()
      );
      try {
        await contract.stake(amount);
        setMyStakes([...myStakes, amount]);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function withdrawStake(index) {
    if (typeof window.ethereum !== "undefined") {
      // await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        address,
        XCoinStaking.abi,
        provider.getSigner()
      );
      try {
        await contract.withdrawStake(index);
        // setMyStakes(myStakes.filter());
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  if (errorMessage !== "") return <p>{errorMessage}</p>;

  return (
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
    </div>
  );
};

export default App;
