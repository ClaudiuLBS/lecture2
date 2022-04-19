// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./XCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract XCoinStaking is XCoin, Ownable{
  
  uint256 stakeInterestRate = 7;
  uint256 loanInterestRate = 12;
  uint256 permittedExceeding = 14 days;
  
  struct Stake {
    uint256 value;
    uint256 monthlyReward;
    uint256 placementDate;
    uint256 nextClaim;
  }
  
  struct Loan {
    uint256 value; //tokens
    uint256 rate; //monthly
    uint256 guaranty; //in wei
    uint256 startDate; 
    uint256 nextRate; 
    uint256 ratesNumber;
  }
  
  mapping(address => bool) public isStakeholder;
  mapping(address => uint256) public totalStakesPerUser;
  mapping(address => Stake[]) public stakes;
  mapping(address => Loan) public loans;

  function convertTokensToDigits(uint256 value) public pure returns(uint256) {
    return value * 1e18;
  }
  
  function convertDigitsToTokens(uint256 value) public pure returns(uint256) {
    return value / 1e18;
  }

  function convertTimestamToDays(uint256 timestamp) public pure returns(uint256) {
    return timestamp / 1 days;
  }

  function calculateGuaranty(uint256 loanValue, uint256 period) public pure returns(uint256) {
    loanValue = convertTokensToDigits(loanValue);
    return (loanValue / 100000) * period;
  }
  
  function calculateTotalPayment(uint256 loanValue, uint period) public view returns(uint256) {
    return loanValue + period * loanValue * loanInterestRate / 100;
  }

  function calculateRate(uint256 totalPaymentValue, uint256 period) public pure returns(uint256) {
    return totalPaymentValue / (period * 12);
  }
  
  function calculateMonthlyReward(uint256 stakeValue) public view returns(uint256) {
    return stakeValue * stakeInterestRate / 100;
  }

  constructor() public {
    uint256 balance = convertTokensToDigits(100000); 
    _mint(msg.sender, balance);
  }

  //nu stiu cum se cheama persoana care face un imprumut
  function penalizeUser(address user) internal{ 
    uint256 difference = block.timestamp - loans[user].nextRate;

    if (difference > permittedExceeding) {
      if ((difference - permittedExceeding) / 1 days < 200) // daca depaseste 200 zile, nu ii mai dam garantia
        //garantia -= nr de zile depasite peste perioada de 14 zile permisa, inmultit cu 0.5% din valoarea garantiei
        loans[user].guaranty -= convertTimestamToDays(difference - permittedExceeding) * loans[user].guaranty / 200;
      else
        loans[user].guaranty = 0;
    }
  }

  function addStakeholder(address stakeholder) public {
    isStakeholder[stakeholder] = true;
  }

  function removeStakeholder(address stakeholder) public {
    isStakeholder[stakeholder] = false;
  }

  function getMyStakes() public view returns (Stake[] memory) {
    return stakes[msg.sender];
  }
  
  function stake(uint256 stakeValue) public {
    stakeValue = convertTokensToDigits(stakeValue); // 1 = 10**18

    approve(msg.sender, stakeValue);
    transferFrom(msg.sender, address(this), stakeValue);

    if(stakes[msg.sender].length == 0) addStakeholder(msg.sender);
    
    stakes[msg.sender].push(
      Stake(
        stakeValue, 
        calculateMonthlyReward(stakeValue),
        block.timestamp, 
        block.timestamp + 30 days
      )
    );
    totalStakesPerUser[msg.sender] += stakeValue;
  }

  function withdrawStake(uint256 stakeIndex) public {
    require(stakes[msg.sender].length > stakeIndex, "Stake doesn't exist");
    require(stakes[msg.sender][stakeIndex].placementDate + 360 days < block.timestamp, "Stake period didn't end yet");
    require(stakes[msg.sender][stakeIndex].nextClaim > block.timestamp, "You have unclaimed rewards");
    require(stakes[msg.sender][stakeIndex].value <= balanceOf(address(this)), "Sorry we are broke");

    uint256 stakeValue = stakes[msg.sender][stakeIndex].value; 

    //stergem stake-ul
    stakes[msg.sender][stakeIndex] = stakes[msg.sender][stakes[msg.sender].length - 1]; 
    stakes[msg.sender].pop(); 
    
    if(stakes[msg.sender].length == 0) removeStakeholder(msg.sender);

    
    _mint(msg.sender, stakeValue);
    _burn(address(this), stakeValue);

    // transfer(msg.sender, stakeValue);
    totalStakesPerUser[msg.sender] -= stakeValue;
  }

  function claim(uint256 stakeIndex) public {
    require(stakes[msg.sender].length > stakeIndex, "Stake doesn't exist");
    require(stakes[msg.sender][stakeIndex].nextClaim <= block.timestamp, "You can claim once a mounth");
    require(stakes[msg.sender][stakeIndex].monthlyReward <= balanceOf(address(this)), "Sorry we are broke");

    _mint(msg.sender, stakes[msg.sender][stakeIndex].monthlyReward);
    _burn(address(this), stakes[msg.sender][stakeIndex].monthlyReward);

    // bool success = transfer(msg.sender, stakes[msg.sender][stakeIndex].monthlyReward);
    // require(success, "can't transfer");
    stakes[msg.sender][stakeIndex].nextClaim += 30 days;
    // return success;
  }

  function borrow(uint256 loanValue, uint256 period) public payable {
    uint256 guaranty = calculateGuaranty(loanValue, period); // 100.000 xCoin => 1 eth
    uint256 loanValue = convertTokensToDigits(loanValue); // 1 xCoin => 10 ** 18 digits
    uint256 paymentValue = calculateTotalPayment(loanValue, period); // adding the interest rate in digits
    uint256 rate = calculateRate(paymentValue, period); //monthly rate in digits 
    
    require(uint256(msg.value) >= guaranty, "Not the correct guaranty");
    require(loans[msg.sender].value == 0, "You can have only one loan at a time.");
    require(loanValue <= balanceOf(address(this)), "We don't have enough tokens");
    
    _mint(msg.sender, loanValue);
    _burn(address(this), loanValue);
    
    loans[msg.sender] = 
      Loan(
        paymentValue, //value
        rate, //monthly rate
        guaranty, //that eth guaranty
        block.timestamp, //start date
        block.timestamp + 30 days, //next rate date
        period * 12 // number of rates
      ); 
  }

  function payRate() public {
    require(block.timestamp > loans[msg.sender].nextRate, "Too early for paying the rate");
    require(loans[msg.sender].value != 0, "You dont have a loan");
    
    //plateste rata
    approve(msg.sender, loans[msg.sender].rate);
    transferFrom(msg.sender, address(this), loans[msg.sender].rate);

    //in cazul in care a platit prea tarziu il penalizam
    penalizeUser(msg.sender);

    loans[msg.sender].ratesNumber -= 1;
    //daca nu mai are rate de platit
    if (loans[msg.sender].ratesNumber == 0) {
      loans[msg.sender].value = 0;
      //daca nu i s-a anulat de tot garantia
      if (loans[msg.sender].guaranty > 0) {
        //ii trimitem inapoi garantia
        (bool success, ) = msg.sender.call{value: loans[msg.sender].guaranty}("");
        require(success, "Failed to send Ether");
      }
    }
    else {
      loans[msg.sender].nextRate += 30 days;
    }
  }
}
