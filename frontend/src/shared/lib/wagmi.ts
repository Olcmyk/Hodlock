import { cookieStorage, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Reown Project ID
export const projectId = "98142860012c5e88d3db516ad6f72950";

// Wagmi Adapter for Reown AppKit
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [base],
  transports: {
    [base.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;
