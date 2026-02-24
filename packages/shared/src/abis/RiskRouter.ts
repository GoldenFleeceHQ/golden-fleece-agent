export const RiskRouterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_identityRegistry", type: "address" },
      { name: "_validationRegistry", type: "address" },
    ],
  },
  {
    type: "function",
    name: "submitTrade",
    inputs: [{ name: "tradeData", type: "bytes" }],
    outputs: [{ name: "approved", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TradeSubmitted",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "tradeHash", type: "bytes32", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TradeApproved",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "tradeHash", type: "bytes32", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TradeRejected",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "tradeHash", type: "bytes32", indexed: true },
      { name: "reason", type: "string", indexed: false },
    ],
  },
] as const;
