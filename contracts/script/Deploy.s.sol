// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {RiskRouter} from "../src/RiskRouter.sol";

contract Deploy is Script {
    function run() external {
        address identityRegistry = vm.envAddress("ERC8004_IDENTITY_REGISTRY");
        address validationRegistry = vm.envAddress("ERC8004_VALIDATION_REGISTRY");

        vm.startBroadcast();

        RiskRouter router = new RiskRouter(identityRegistry, validationRegistry);
        console.log("RiskRouter deployed at:", address(router));

        vm.stopBroadcast();
    }
}
