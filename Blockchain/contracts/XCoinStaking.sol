// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./XCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XCoinStaking is XCoin, Ownable{
  
  uint percent = 10; 
  address[] internal stakeholders;
  mapping(address => uint256[]) internal stakes;
  mapping(address => uint256) internal rewards;

  constructor(uint256 _supply) public {
    _mint(msg.sender, _supply);
  }

  function isStakeholder(address _address) private returns(bool, uint256) {
    for (uint256 i = 0; i < stakeholders.length; i += 1){
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

  function getStakeInfo(uint index) public view returns(uint256) {
    return stakes[msg.sender][index];
  }

  function getTotalStakedAmount(address _stakeholder) public view returns(uint256) {
    uint256 _totalStakes = 0;
    for (uint256 i = 0; i < stakes[_stakeholder].length; i += 1) {
      _totalStakes += stakes[_stakeholder][i];
    } 
    return _totalStakes;
  }


  function totalStakes() public view onlyOwner returns(uint256) {
    uint256 _totalStakes = 0;
    for (uint256 i = 0; i < stakeholders.length; i += 1){
      _totalStakes = _totalStakes + getTotalStakedAmount(stakeholders[i]);
    }
    return _totalStakes;
  }
  function stake(uint256 _stake) public {
    _burn(msg.sender, _stake);
    if(stakes[msg.sender].length == 0) addStakeholder(msg.sender);
    stakes[msg.sender].push(_stake);
  }

  function withdrawStake(uint256 _stakeIndex) public {
    uint256 _stakeValue = stakes[msg.sender][_stakeIndex]; // salvam valoare
    stakes[msg.sender][_stakeIndex] = stakes[msg.sender][stakes[msg.sender].length - 1]; //ii alocam valoarea de pe ultima pozitie
    stakes[msg.sender].pop(); //eliminam ultimul element
    if(stakes[msg.sender].length == 0) removeStakeholder(msg.sender);
    _mint(msg.sender, _stakeValue);
  }

  function rewardOf(address _stakeholder) public view returns(uint256) {
    return rewards[_stakeholder];
  }

  function calculateReward(address _stakeholder) public view returns(uint256) {
    return getTotalStakedAmount(_stakeholder) * percent / 100;
  }

  function distributeRewards() public onlyOwner {
    for (uint256 i = 0; i < stakeholders.length; i += 1){
      address _stakeholder = stakeholders[i];
      uint256 _reward = calculateReward(_stakeholder);
      rewards[_stakeholder] = rewards[_stakeholder] + _reward;
    }
  }

  function claim() public {
    uint256 reward = rewards[msg.sender];
    rewards[msg.sender] = 0;
    _mint(msg.sender, reward);
  }
}


