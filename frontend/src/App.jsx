import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@mui/material";

import { Link, Route, Routes } from "react-router-dom";

import { address } from "./address";
import XCoinStaking from "./artifacts/contracts/XCoinStaking.sol/XCoinStaking.json";
import MainScreen from "./screens/MainScreen";
import AdminScreen from "./screens/AdminScreen";

const App = () => {
  const [stakingAmount, setStakingAmount] = useState();
  const [myStakes, setMyStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabledStakeButton, setEnabledStakeButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingTransation, setPendingTransaction] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [rewards, setRewards] = useState(0);

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

    const rewardValue = await contract.rewardOf(account[0]);
    setRewards(parseInt(rewardValue._hex));

    if (account.length > 0) {
      const ownerAddress = await contract.owner();
      if (ownerAddress.toLowerCase() == account[0].toLowerCase())
        setIsOwner(true);
    }
  }

  async function getStakePlacements() {
    try {
      const stakePlacementsNumber = await contract.getMyStakesNumber();
      let myOldStakes = [];
      for (let i = 0; i < stakePlacementsNumber; i++) {
        try {
          const data = await contract.getStakeInfo(i);
          myOldStakes.push(parseInt(data._hex) / Math.pow(10, 18));
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

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      requestAccount()
        .then(() => setErrorMessage(""))
        .catch(() =>
          setErrorMessage("Pleas log in into your metamask account")
        );
      getStakePlacements();
    } else setErrorMessage("install metamask");
  }, []);

  async function stake(amount) {
    try {
      const data = await contract.stake(amount);
      const currentTxHash = data.hash;
      setTxHash(data.hash);

      setPendingTransaction(true);
      provider.once(currentTxHash, (transaction) => {
        setMyStakes([...myStakes, amount]);
        setPendingTransaction(false);
        setStakingAmount(0);
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  async function withdrawStake(index) {
    try {
      const data = await contract.withdrawStake(index);
      const currentTxHash = data.hash;
      setTxHash(data.hash);
      setPendingTransaction(true);

      provider.once(currentTxHash, (transaction) => {
        setPendingTransaction(false);
        setMyStakes(myStakes.filter((item, itemIndex) => itemIndex !== index));
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  async function claimRewards() {
    try {
      const data = await contract.claim();
      const currentTxHash = data.hash;

      setTxHash(data.hash);
      setPendingTransaction(true);
      provider.once(currentTxHash, (transaction) => {
        setPendingTransaction(false);
        setRewards(0);
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  async function swapEthToXCoin(amount) {
    await requestAccount();
    const signer = provider.getSigner();

    let senderAddress = "";
    await signer.getAddress().then((result) => (senderAddress = result));
    let gasPrice;

    await provider.getGasPrice().then((result) => (gasPrice = result));
    const transactionSettings = {
      from: senderAddress,
      to: address,
      value: ethers.utils.parseUnits(amount.toString(), "ether"),
      gasPrice: gasPrice,
      gasLimit: ethers.utils.hexlify(100000),
      nonce: provider.getTransactionCount(senderAddress, "latest"),
    };
    const transaction = await signer.sendTransaction(transactionSettings);
  }

  if (errorMessage !== "") return <p>{errorMessage}</p>;

  return (
    <div>
      <nav>
        <Link className="nav-link" to="/">
          Home
        </Link>
        <Link className="nav-link" to="/admin">
          Admin
        </Link>
        <Button
          className="Button"
          variant="contained"
          onClick={() => swapEthToXCoin(0.1)}
        >
          Swap .1 eth to xCoin
        </Button>
      </nav>
      <p style={{ textAlign: "center", marginTop: "1em" }}>
        ATENTIE! SCHIMBATI NETWORKUL PE RINKEBY
      </p>
      <div className="main-container">
        <Routes>
          <Route
            path="/"
            element={
              <MainScreen
                stakingAmount={stakingAmount}
                setStakingAmount={setStakingAmount}
                stake={stake}
                enabledStakeButton={enabledStakeButton}
                myStakes={myStakes}
                withdrawStake={withdrawStake}
                txHash={txHash}
                pendingTransation={pendingTransation}
                loading={loading}
                rewards={rewards}
                claimRewards={claimRewards}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminScreen
                isOwner={isOwner}
                contract={contract}
                provider={provider}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
