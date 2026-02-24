// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {RiskRouter} from "../src/RiskRouter.sol";
import {IERC8004Identity} from "../src/interfaces/IERC8004Identity.sol";
import {IERC8004Validation} from "../src/interfaces/IERC8004Validation.sol";

/// @notice Mock identity registry that always returns registered
contract MockIdentity is IERC8004Identity {
    function registerAgent(address, string calldata) external {}
    function isRegistered(address) external pure returns (bool) { return true; }
    function getMetadataURI(address) external pure returns (string memory) { return "ipfs://test"; }
}

/// @notice Mock validation registry that always approves
contract MockValidation is IERC8004Validation {
    function validateTrade(address, bytes calldata)
        external
        pure
        returns (bool valid, string memory reason)
    {
        return (true, "");
    }
}

contract RiskRouterTest is Test {
    RiskRouter public router;
    MockIdentity public identity;
    MockValidation public validation;

    function setUp() public {
        identity = new MockIdentity();
        validation = new MockValidation();
        router = new RiskRouter(address(identity), address(validation));
    }

    function test_submitTrade_approved() public {
        bool approved = router.submitTrade(hex"deadbeef");
        assertTrue(approved);
    }

    function test_owner_is_deployer() public view {
        assertEq(router.owner(), address(this));
    }
}
