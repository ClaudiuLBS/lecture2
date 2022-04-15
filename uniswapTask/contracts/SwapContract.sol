//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract SwapContract {
    address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address private constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniswapV2Router01 router = IUniswapV2Router01(ROUTER);

    function fromETHtoTokens() public payable{
        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = USDT;
        uint256 deadline = block.timestamp + 120;
        router.swapExactETHForTokens{ value: msg.value }(0, path, msg.sender, deadline);
    }
}