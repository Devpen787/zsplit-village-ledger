
import { createConfig } from '@wagmi/core';
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'viem';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { createPublicClient } from 'viem';

// Use the provided WalletConnect Project ID
export const projectId = '15e72db89587fa8bd14473b8ff73a0bb';

// Create public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Create wagmi config
export const wagmiConfig = createConfig({
  publicClient,
  connectors: [
    new InjectedConnector({ 
      chains: [mainnet, sepolia],
      options: {
        name: 'MetaMask',
        shimDisconnect: true,
      }
    }),
    new WalletConnectConnector({
      chains: [mainnet, sepolia],
      options: {
        projectId,
      }
    }),
  ],
});
