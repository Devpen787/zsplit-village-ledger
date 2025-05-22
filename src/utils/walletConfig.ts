
import { createConfig } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'viem';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { createPublicClient } from 'viem';
import { QueryClient } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';

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

// Initialize Web3Modal with our configuration
// This should be called once during app startup
export const initializeWeb3Modal = () => {
  return createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: false,
    themeMode: 'light',
    // Fix: Use correctly typed theme variables
    themeVariables: {
      // Use valid theme variables
      '--w3m-accent': '#0ea5e9', // Match the app's primary color
    },
  });
};
