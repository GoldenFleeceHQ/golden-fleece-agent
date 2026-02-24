export const IdentityRegistryAbi = [
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "agentAddress", type: "address" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isRegistered",
    inputs: [{ name: "agentAddress", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMetadataURI",
    inputs: [{ name: "agentAddress", type: "address" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;
