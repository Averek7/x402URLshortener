import { expect } from "chai";
import { network } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-ethers-chai-matchers/withArgs";
const { ethers } = await network.connect();

function toBytes6(str: any) {
  const buf = Buffer.alloc(6);
  buf.fill(0);
  Buffer.from(str).copy(buf);
  return "0x" + buf.toString("hex");
}

describe("UrlShortner", function () {
  let URLShortener, contract: any;
  let owner: any, facilitator: any, user: any, other: any;

  beforeEach(async () => {
    [owner, facilitator, user, other] = await ethers.getSigners();

    URLShortener = await ethers.getContractFactory("UrlShortner");
    contract = await URLShortener.deploy(facilitator.address);
    await contract.waitForDeployment();
  });


  it("deploys correctly with owner + facilitator", async () => {
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.facilitator()).to.equal(facilitator.address);
  });

  it("allows only facilitator to store URLs", async () => {
    const code = toBytes6("abc123");

    await expect(
      contract.connect(user).storeShortUrl(code, "https://example.com")
    ).to.be.revertedWithCustomError(contract, "NotFacilitator");

    const tx = await contract.connect(facilitator).storeShortUrl(
      code,
      "https://example.com"
    );

    await expect(tx)
      .to.emit(contract, "Shortened")
      .withArgs(code, "https://example.com", facilitator.address, anyValue);
  });

  // Prevent overwrite
  it("prevents overwriting an existing code", async () => {
    const code = toBytes6("abc111");
    await contract.connect(facilitator).storeShortUrl(code, "A");

    await expect(
      contract.connect(facilitator).storeShortUrl(code, "B")
    ).to.be.revertedWithCustomError(contract, "CodeAlreadyExists");
  });

  // Check resolve + info
  it("resolves URLs correctly", async () => {
    const code = toBytes6("abz900");
    const url = "https://github.com";

    await contract.connect(facilitator).storeShortUrl(code, url);

    expect(await contract.resolve(code)).to.equal(url);
  });

  it("returns metadata via info()", async () => {
    const code = toBytes6("hel001");
    const url = "https://hello.com";

    const tx = await contract.connect(facilitator).storeShortUrl(code, url);
    const receipt = await tx.wait();

    const block = await ethers.provider.getBlock(receipt.blockNumber);
    if (!block) throw new Error("Block not found");

    const [returnedUrl, ts, creator] = await contract.info(code);

    expect(returnedUrl).to.equal(url);
    expect(Number(ts)).to.equal(block.timestamp);
    expect(creator).to.equal(facilitator.address);
  });

  // Owner-only: setFacilitator
  it("allows only owner to change facilitator", async () => {
    await expect(
      contract.connect(other).setFacilitator(user.address)
    ).to.be.revertedWithCustomError(contract, "NotOwner");

    await contract.connect(owner).setFacilitator(user.address);
    expect(await contract.facilitator()).to.equal(user.address);
  });
});
