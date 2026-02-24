// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IERC8004Reputation — Agent reputation registry interface
/// @notice Stub interface for ERC-8004 Reputation Registry
interface IERC8004Reputation {
    /// @notice Get the reputation score for an agent
    /// @param agentAddress The agent's wallet address
    /// @return score The current reputation score (0-10000 basis points)
    function getReputation(address agentAddress) external view returns (uint256 score);

    /// @notice Update reputation based on trade outcome
    /// @param agentAddress The agent's wallet address
    /// @param tradeHash Hash of the trade for verification
    /// @param positive Whether the outcome was positive
    function updateReputation(
        address agentAddress,
        bytes32 tradeHash,
        bool positive
    ) external;
}
