require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const { paymentMiddleware } = require("x402-express");

const app = express();
app.use(cors());
app.use(cors({ origin: "*" }));
app.use(express.json());

const RPC_URL = process.env.BASE_RPC_URL;
const FACILITATOR_PRIVATE_KEY = process.env.FACILITATOR_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PAYMENT_RECEIVER = process.env.PAYMENT_RECEIVER;
const PORT = process.env.PORT || 3001;

const facilitatorObj = { url: "https://x402.org/facilitator" };

const provider = new ethers.JsonRpcProvider(RPC_URL);

let facilitatorWallet = null;
if (FACILITATOR_PRIVATE_KEY) {
  facilitatorWallet = new ethers.Wallet(FACILITATOR_PRIVATE_KEY, provider);
}

const URL_SHORTENER_ABI = [
  "function storeShortUrl(bytes6 code, string calldata longUrl) external",
  "function resolve(bytes6 code) external view returns (string)",
];

const writeContract =
  facilitatorWallet && CONTRACT_ADDRESS
    ? new ethers.Contract(
        CONTRACT_ADDRESS,
        URL_SHORTENER_ABI,
        facilitatorWallet
      )
    : null;

const readContract =
  provider && CONTRACT_ADDRESS
    ? new ethers.Contract(CONTRACT_ADDRESS, URL_SHORTENER_ABI, provider)
    : null;

const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function genCode() {
  return Array.from({ length: 6 }, () => {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }).join("");
}

function toBytes6(str) {
  const buf = Buffer.alloc(6);
  buf.fill(0);
  Buffer.from(str, "utf8").copy(buf, 0, 0, 6);
  return "0x" + buf.toString("hex");
}

// paymentMiddleware(payTo, routes, facilitator, meta)
app.use(
  paymentMiddleware(
    PAYMENT_RECEIVER,
    {
      "POST /shorten": {
        price: "$0.001",
        network: "base-sepolia",
      },
    },
    facilitatorObj
  )
);

app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: "longUrl is required" });
  }

  try {
    // 1. Generate new code
    let code = genCode();
    let codeBytes = toBytes6(code);

    // 2. Ensure unique on-chain
    const existing = await readContract.resolve(codeBytes);
    if (existing && existing.length > 0) {
      return res.status(500).json({ error: "collision, try again" });
    }

    // 3. Write to smart contract
    const tx = await writeContract.storeShortUrl(codeBytes, longUrl);
    const receipt = await tx.wait();

    // 4. Respond to client
    return res.status(200).json({
      ok: true,
      shortCode: code,
      shortUrl: `https://x402.url/${code}`,
      txHash: tx.hash,
    });
  } catch (err) {
    console.error("Shorten error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/:code", async (req, res) => {
  try {
    const code = req.params.code;

    if (!code || code.length > 6) {
      return res.status(400).send("Invalid code");
    }

    const longUrl = await readContract.resolve(toBytes6(code));

    if (!longUrl || longUrl.length === 0) {
      return res.status(404).send("Not found");
    }

    return res.redirect(302, longUrl);
  } catch (err) {
    console.error("GET /:code error:", err);
    return res.status(500).send("Server error");
  }
});

app.get("/", (req, res) => {
  return res.json({
    message: "x402 URL Shortener Live!",
  });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`🚀 x402 backend running on http://localhost:${PORT}`);
});
