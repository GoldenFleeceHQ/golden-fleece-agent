// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

/// @notice Integration tests that run against an Anvil fork of Base Sepolia
/// @dev Run with: forge test --match-path "test/fork/*" --fork-url $BASE_SEPOLIA_RPC
contract ForkTest is Test {
    function test_base_sepolia_is_live() public view {
        // Verify we're on a fork by checking chainid
        // Base Sepolia chainId = 84532
        assertEq(block.chainid, 84532);
    }
}
