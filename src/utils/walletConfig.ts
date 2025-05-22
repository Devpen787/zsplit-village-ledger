
import { createConfig } from '@wagmi/core';
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'viem';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';

// Use the provided WalletConnect Project ID
export const projectId = '15e72db89587fa8bd14473b8ff73a0bb';

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia], 
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
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
