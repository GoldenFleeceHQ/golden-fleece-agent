export const ReputationRegistryAbi = [
  {
    type: "function",
    name: "getReputation",
    inputs: [{ name: "agentAddress", type: "address" }],
    outputs: [{ name: "score", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updateReputation",
    inputs: [
      { name: "agentAddress", type: "address" },
      { name: "tradeHash", type: "bytes32" },
      { name: "positive", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
