// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./XCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract XCoinStaking is XCoin, Ownable{
  
  uint256 percent = 10; 
  address[] internal stakeholders;
  
  mapping(address => uint256) public totalStakesPerUser;
  mapping(address => uint256[]) public stakes;

  function convertDigitsToToken(uint256 value) public view returns(uint256) {
    return value * (10**18);
    // return value;
  }

  function convertTokenToDigits(uint256 value) private view returns(uint256) {
    return value / (10**18);
  }
  
  constructor() public {
    uint256 balance = convertDigitsToToken(100000); 
    _mint(msg.sender, balance);
  }
  

  // receive() external payable {
  //   _mint(msg.sender, msg.value * (10**10));
  // }


  function isStakeholder(address _address) private returns(bool, uint256) {
    for (uint256 i = 0; i < stakeholders.length; i += 1) {
      if (_address == stakeholders[i]) return (true, i);
    }
    return (false, 0);
  }

  function addStakeholder(address _stakeholder) private {
    (bool _isStakeholder, ) = isStakeholder(_stakeholder);
    if(!_isStakeholder) stakeholders.push(_stakeholder);
  }

  function removeStakeholder(address _stakeholder) private {
    (bool _isStakeholder, uint256 i) = isStakeholder(_stakeholder);
    if(_isStakeholder) {
      stakeholders[i] = stakeholders[stakeholders.length - 1];
      stakeholders.pop();
    }
  }

  function getMyStakesNumber() public view returns(uint256){
    return stakes[msg.sender].length;
  }

  function getStakeValue(uint index) public view returns(uint256) {
    return stakes[msg.sender][index];
  }

  function getMyStakes() public view returns (uint256[] memory) {
    return stakes[msg.sender];
  }
  
  function stake(uint256 stakeValue) public {
    stakeValue = convertDigitsToToken(stakeValue);
    approve(msg.sender, stakeValue);
    transferFrom(msg.sender, address(this), stakeValue);

    if(stakes[msg.sender].length == 0) addStakeholder(msg.sender);

    stakes[msg.sender].push(stakeValue);
    totalStakesPerUser[msg.sender] += stakeValue;
  }

  function withdrawStake(uint256 _stakeIndex) public {
    uint256 stakeValue = stakes[msg.sender][_stakeIndex]; // salvam valoare
    stakes[msg.sender][_stakeIndex] = stakes[msg.sender][stakes[msg.sender].length - 1]; //ii alocam valoarea de pe ultima pozitie
    stakes[msg.sender].pop(); //eliminam ultimul element
    if(stakes[msg.sender].length == 0) removeStakeholder(msg.sender);
    transfer(msg.sender, stakeValue);
    totalStakesPerUser[msg.sender] -= stakeValue;
    
  }



  function claim() public {
    // _mint(msg.sender, reward);
  }
}


