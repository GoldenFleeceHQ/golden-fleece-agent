// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IERC8004Identity — Agent identity registry interface
/// @notice Stub interface for ERC-8004 Identity Registry
interface IERC8004Identity {
    /// @notice Register a new agent identity
    /// @param agentAddress The agent's wallet address
    /// @param metadataURI IPFS URI pointing to agent metadata
    function registerAgent(address agentAddress, string calldata metadataURI) external;

    /// @notice Check if an address is a registered agent
    /// @param agentAddress The address to check
    /// @return True if the address is registered
    function isRegistered(address agentAddress) external view returns (bool);

    /// @notice Get the metadata URI for a registered agent
    /// @param agentAddress The agent's wallet address
    /// @return The IPFS metadata URI
    function getMetadataURI(address agentAddress) external view returns (string memory);
}
