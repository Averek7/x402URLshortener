import { network } from "hardhat";
import dotenv from "dotenv";

const { ethers } = await network.connect({});
dotenv.config();

const { BASE_API_KEY, FACILITATOR_PRIVATE_KEY } = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!process.env.FACILITATOR_PRIVATE_KEY) {
    throw new Error("FACILITATOR_PRIVATE_KEY missing in .env");
  }

  const facilitatorPK = process.env.FACILITATOR_PRIVATE_KEY!;
  const RPC_URL = `https://base-sepolia.g.alchemy.com/v2/${process.env.BASE_API_KEY!}`;
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const facilitator = new ethers.Wallet(facilitatorPK, provider);

  const UrlShortner = await ethers.getContractFactory("UrlShortner");
  const contract = await UrlShortner.deploy(facilitator.address);

  await contract.deploymentTransaction()?.wait();

  console.log("Deployed at:", await contract.getAddress());
}

main().catch(err => console.error(err));