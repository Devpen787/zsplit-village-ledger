
import { createConfig } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'viem';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { createPublicClient } from 'viem';
import { QueryClient } from '@tanstack/react-query';

// Use the provided WalletConnect Project ID
export const projectId = '15e72db89587fa8bd14473b8ff73a0bb';

// Create public client
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Create a query client for Wagmi react integration
export const queryClient = new QueryClient();

// Create wagmi config
export const wagmiConfig = createConfig({
  publicClient,
  queryClient,
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
