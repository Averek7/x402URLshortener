import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import dotenv from "dotenv";
import { basename } from "path";

dotenv.config();

const { API_KEY, PRIVATE_KEY } = process.env;
export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: `https://base-sepolia.g.alchemy.com/v2/${API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    }
  },
});
