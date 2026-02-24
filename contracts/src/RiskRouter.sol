// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC8004Identity} from "./interfaces/IERC8004Identity.sol";
import {IERC8004Validation} from "./interfaces/IERC8004Validation.sol";

/// @title RiskRouter — On-chain trade intent verification
/// @notice Routes trade intents through ERC-8004 validation before execution
contract RiskRouter {
    IERC8004Identity public immutable identityRegistry;
    IERC8004Validation public immutable validationRegistry;

    address public owner;

    event TradeSubmitted(address indexed agent, bytes32 indexed tradeHash);
    event TradeApproved(address indexed agent, bytes32 indexed tradeHash);
    event TradeRejected(address indexed agent, bytes32 indexed tradeHash, string reason);

    error NotRegisteredAgent();
    error NotOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _identityRegistry, address _validationRegistry) {
        identityRegistry = IERC8004Identity(_identityRegistry);
        validationRegistry = IERC8004Validation(_validationRegistry);
        owner = msg.sender;
    }

    /// @notice Submit a trade intent for validation
    /// @param tradeData Encoded trade parameters
    /// @return approved Whether the trade was approved
    function submitTrade(bytes calldata tradeData) external returns (bool approved) {
        if (!identityRegistry.isRegistered(msg.sender)) {
            revert NotRegisteredAgent();
        }

        bytes32 tradeHash = keccak256(abi.encodePacked(msg.sender, tradeData, block.timestamp));
        emit TradeSubmitted(msg.sender, tradeHash);

        (bool valid, string memory reason) = validationRegistry.validateTrade(
            msg.sender,
            tradeData
        );

        if (valid) {
            emit TradeApproved(msg.sender, tradeHash);
            return true;
        } else {
            emit TradeRejected(msg.sender, tradeHash, reason);
            return false;
        }
    }
}
