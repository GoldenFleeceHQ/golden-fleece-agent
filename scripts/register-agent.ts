/**
 * Register agent identity on ERC-8004 Identity Registry (Base Sepolia).
 * Usage: pnpm --filter scripts tsx register-agent.ts
 */

import "dotenv/config";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { IdentityRegistryAbi } from "@golden-fleece/shared";

async function main() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  const registryAddress = process.env.ERC8004_IDENTITY_REGISTRY;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC ?? "https://sepolia.base.org";

  if (!privateKey || !registryAddress) {
    console.error("Missing AGENT_PRIVATE_KEY or ERC8004_IDENTITY_REGISTRY in .env");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({ chain: baseSepolia, transport });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport });

  console.log(`Registering agent ${account.address} on registry ${registryAddress}...`);

  // TODO: Replace with actual metadata URI from IPFS
  const metadataURI = "ipfs://placeholder";

  const hash = await walletClient.writeContract({
    address: registryAddress as `0x${string}`,
    abi: IdentityRegistryAbi,
    functionName: "registerAgent",
    args: [account.address, metadataURI],
  });

  console.log(`Transaction submitted: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber}`);
}

main().catch(console.error);
