// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IERC8004Validation — Trade validation registry interface
/// @notice Stub interface for ERC-8004 Validation Registry
interface IERC8004Validation {
    /// @notice Validate a trade intent before execution
    /// @param agentAddress The agent submitting the trade
    /// @param tradeData Encoded trade parameters
    /// @return valid Whether the trade passes validation
    /// @return reason Human-readable reason if invalid
    function validateTrade(
        address agentAddress,
        bytes calldata tradeData
    ) external view returns (bool valid, string memory reason);
}
