# 🚀 X402 — On-Chain URL Shortener (Base Sepolia)

A fully decentralized **on-chain URL Shortener** built with:

- **Base Sepolia (EVM chain)**
- **Solidity Smart Contract**
- **Node.js Express Backend**
- **Viem Wallet Client**
- **Next.js Frontend**
- **x402 Wallet-Based Payments**

Contract Address: **0x6c26e052d97dbE6763643E14FB8C9A23Ef32C7EE**  
Frontend Deployment: **https://x402-ur-lshortener.vercel.app**

---

## 📘 Overview

X402 is a censorship-resistant, trustless URL shortener where every shortened URL is **stored on-chain**, making it immutable and publicly verifiable. The frontend, backend, and contract work together to provide a seamless experience for users while ensuring decentralized data integrity.

---

## 🧩 How It Works

1. **User enters long URL** on the frontend.
2. **Backend generates a 6-byte short code**.
3. **Backend sends a transaction** to store the mapping `(shortCode → longUrl)` on-chain.
4. **Frontend displays short URL** to the user.
5. When the user visits the short URL, the backend **resolves the code using the smart contract** and redirects.

---

## 🏗️ Project Structure

    x402/
    │── backend/
    │── frontend/
    │── contract/
    │── README.md

---

## 🧠 Architecture Diagram

```mermaid
graph LR

A[User] --> B[Next.js Frontend]
B --> C[Backend (Node.js + Express)]
C --> D[(Smart Contract <br/> Base Sepolia)]
D --> C
C -->|Redirect Lookup| E[Redirect Handler]
E --> A

B -->|Wallet Payment (x402)| F[Payment Receiver]
```

## 🪙 Smart Contract

```solidity
function storeShortUrl(bytes6 code, string calldata longUrl) external;
function resolve(bytes6 code) external view returns (string memory);
```

## ⚙️ Backend API Routes

### POST /shorten

Request:

```json
{ "longUrl": "https://example.com" }
```

Response:

```json
{
  "ok": true,
  "shortCode": "0eRDEc",
  "shortUrl": "https://x402urlshortener.onrender.com/0eRDEc",
  "txHash": "0xabc123..."
}
```

### GET /:code

Redirects to stored URL.

## 🔧 Backend Setup

    npm install
    npm start

Environment variables:

    RPC_URL=
    FACILITATOR_PRIVATE_KEY=
    CONTRACT_ADDRESS=
    PAYMENT_RECEIVER=

## 🎨 Frontend Setup

    npm install
    npm run dev

## 🧪 Common Issues

### BAD_DATA decode

Fix: Check contract deployment.

### Insufficient Funds

Fix: Fund facilitator wallet.

## ✔️ Features

- Decentralized URL Storage\
- Base Sepolia Smart Contract\
- Wallet-based payments via x402\
- Full redirect system\
- Decentralized storage guarantees immutability

## 🏁 Pending

- Swagger API Documentation\
- Postman Collection\
- System Architecture Diagram (SVG/PNG)\
